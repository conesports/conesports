import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { upsertCheckoutCustomer } from "@/lib/customer";
import { validateDiscountCode } from "@/lib/discount";
import { appUrl, effectivePriceKobo, koboToUsdCents } from "@/lib/money";
import { initializePaystackTransaction } from "@/lib/paystack";
import { initializeFlutterwavePayment } from "@/lib/flutterwave";
import { getNgnPerUsd } from "@/lib/settings";
import {
  calculateShipping,
  getShippingConfig,
  selectCheckoutGateway,
} from "@/lib/shipping";
import { cookies } from "next/headers";

export type CheckoutShipping = {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  saveAddress?: boolean;
};

export type CheckoutItem = { variantId: string; quantity: number };

const CART_SESSION_COOKIE = "cs_cart_sid";

export async function priceCheckout(opts: {
  items: CheckoutItem[];
  country: string;
  discountCode?: string;
}) {
  const variants = await prisma.variant.findMany({
    where: { id: { in: opts.items.map((i) => i.variantId) } },
    include: { product: true },
  });
  if (variants.length !== opts.items.length) {
    throw new Error("One or more items are no longer available");
  }

  const lineItems = opts.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const product = variant.product;
    if (!product.priceConfirmed || product.price <= 0) {
      throw new Error(`Price unavailable for ${product.name}`);
    }
    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const unit = effectivePriceKobo(product.price, product.discountPercent);
    if (unit <= 0) throw new Error(`Price unavailable for ${product.name}`);
    return { variant, product, quantity: item.quantity, unit };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.unit * li.quantity, 0);
  let discountAmount = 0;
  let discountId: string | undefined;
  let discountCode: string | undefined;

  if (opts.discountCode) {
    const applied = await validateDiscountCode(opts.discountCode, subtotal);
    if (!applied.ok) throw new Error(applied.error);
    discountAmount = applied.discountAmount;
    discountId = applied.discount.id;
    discountCode = applied.discount.code;
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingConfig = await getShippingConfig();
  const shipping = calculateShipping(
    lineItems,
    { country: opts.country },
    afterDiscount,
    shippingConfig,
  );
  const total = afterDiscount + shipping.shippingKobo;
  const gateway = selectCheckoutGateway(opts.country);
  const ngnPerUsd = await getNgnPerUsd();

  return {
    lineItems,
    subtotal,
    discountAmount,
    discountId,
    discountCode,
    shippingCost: shipping.shippingKobo,
    isFreeShipping: shipping.isFree,
    total,
    gateway,
    domestic: shipping.domestic,
    ngnPerUsd,
    chargeUsdCents: koboToUsdCents(total, ngnPerUsd),
  };
}

export async function startCheckout(opts: {
  items: CheckoutItem[];
  shipping: CheckoutShipping;
  discountCode?: string;
  gateway?: "paystack" | "flutterwave"; // ignored — region selects the gateway
}) {
  const session = await auth();
  const priced = await priceCheckout({
    items: opts.items,
    country: opts.shipping.country,
    discountCode: opts.discountCode,
  });
  const gateway = priced.gateway;
  const email = opts.shipping.email.toLowerCase();

  const customer = await upsertCheckoutCustomer({
    userId: session?.user?.id,
    name: opts.shipping.name,
    email,
    phone: opts.shipping.phone,
  });

  if (session?.user?.id && opts.shipping.saveAddress) {
    const hasDefault = await prisma.address.findFirst({
      where: { customerId: customer.id, isDefault: true },
    });
    await prisma.address.create({
      data: {
        customerId: customer.id,
        label: "Shipping",
        line1: opts.shipping.line1,
        line2: opts.shipping.line2,
        city: opts.shipping.city,
        state: opts.shipping.state,
        country: opts.shipping.country,
        postalCode: opts.shipping.postalCode,
        isDefault: !hasDefault,
      },
    });
  }

  const currency = gateway === "flutterwave" ? "usd" : "ngn";
  const storedTotal =
    currency === "usd" ? priced.chargeUsdCents : priced.total;
  const storedSubtotal =
    currency === "usd"
      ? koboToUsdCents(priced.subtotal, priced.ngnPerUsd)
      : priced.subtotal;
  const storedShipping =
    currency === "usd"
      ? koboToUsdCents(priced.shippingCost, priced.ngnPerUsd)
      : priced.shippingCost;
  const storedDiscount =
    currency === "usd"
      ? koboToUsdCents(priced.discountAmount, priced.ngnPerUsd)
      : priced.discountAmount;

  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id,
      customerId: customer.id,
      email,
      phone: opts.shipping.phone,
      status: "PENDING",
      gateway,
      currency,
      subtotal: storedSubtotal,
      shippingCost: storedShipping,
      discountAmount: storedDiscount,
      discountCode: priced.discountCode,
      discountId: priced.discountId,
      total: storedTotal,
      shippingAddress: {
        name: opts.shipping.name,
        line1: opts.shipping.line1,
        line2: opts.shipping.line2 ?? "",
        city: opts.shipping.city,
        state: opts.shipping.state ?? "",
        country: opts.shipping.country,
        postalCode: opts.shipping.postalCode ?? "",
        phone: opts.shipping.phone ?? "",
      },
      items: {
        create: priced.lineItems.map((li) => ({
          productId: li.product.id,
          variantId: li.variant.id,
          name: li.product.name,
          size: li.variant.size,
          color: li.variant.color,
          price:
            currency === "usd"
              ? koboToUsdCents(li.unit, priced.ngnPerUsd)
              : li.unit,
          quantity: li.quantity,
          image: li.product.images[0] ?? null,
        })),
      },
    },
  });

  const reference = `cs_${order.id}`;
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: reference },
  });

  if (priced.discountId) {
    await prisma.discountRedemption.create({
      data: {
        discountId: priced.discountId,
        orderId: order.id,
        email,
      },
    });
  }

  const jar = await cookies();
  const sessionId = jar.get(CART_SESSION_COOKIE)?.value;
  if (sessionId) {
    await prisma.abandonedCart.updateMany({
      where: { sessionId, recoveredAt: null },
      data: { recoveredAt: new Date() },
    });
  }

  const callbackUrl = `${appUrl()}/checkout/success?order=${order.id}`;

  if (gateway === "flutterwave") {
    const pay = await initializeFlutterwavePayment({
      email,
      name: opts.shipping.name,
      phone: opts.shipping.phone,
      amountMajor: storedTotal / 100,
      currency: "USD",
      txRef: reference,
      redirectUrl: callbackUrl,
      orderId: order.id,
    });
    return {
      id: order.id,
      authorizationUrl: pay.authorizationUrl,
      reference: pay.reference,
      gateway,
    };
  }

  const pay = await initializePaystackTransaction({
    email,
    amount: storedTotal,
    reference,
    callbackUrl,
    orderId: order.id,
    currency: "NGN",
  });
  return {
    id: order.id,
    authorizationUrl: pay.authorizationUrl,
    reference: pay.reference,
    gateway,
  };
}
