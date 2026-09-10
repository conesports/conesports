import Link from "next/link";
import { confirmPaymentForOrder, confirmPaystackPayment, confirmFlutterwavePayment } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string;
    order?: string;
    trxref?: string;
    tx_ref?: string;
  }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference || sp.trxref || sp.tx_ref;
  const orderId = sp.order;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
    : reference
      ? await prisma.order.findUnique({
          where: { paymentReference: reference },
          include: { items: true },
        })
      : null;

  if (order?.paymentReference) {
    await confirmPaymentForOrder({
      id: order.id,
      gateway: order.gateway,
      paymentReference: order.paymentReference,
    });
  } else if (reference) {
    await confirmPaystackPayment({ reference, expectedOrderId: orderId });
    await confirmFlutterwavePayment({ reference, expectedOrderId: orderId }).catch(
      () => undefined,
    );
  }

  const refreshed = order
    ? await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      })
    : null;

  if (!refreshed) {
    return (
      <section>
        <h1 className="mb-2 text-2xl font-semibold">Thanks</h1>
        <p>If you completed payment, a confirmation email is on the way.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <ClearCartOnMount />
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p>Status: {refreshed.status}</p>
      <p>Total: {formatMoney(refreshed.total, refreshed.currency)}</p>
      <ul className="text-sm">
        {refreshed.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <Link href="/shop">Continue shopping</Link>
    </section>
  );
}
