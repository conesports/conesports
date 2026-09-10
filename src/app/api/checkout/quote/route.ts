import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCheckout } from "@/lib/checkout";
import { rateLimitResponse } from "@/lib/rate-limit";

const quoteSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.coerce.number().int().min(1).max(99),
    }),
  ).min(1),
  country: z.string().min(2),
  discountCode: z.string().optional(),
});

export async function POST(req: Request) {
  const limited = await rateLimitResponse(req, "checkout");
  if (limited) return limited;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote payload" }, { status: 400 });
  }

  try {
    const priced = await priceCheckout(parsed.data);
    return NextResponse.json({
      subtotal: priced.subtotal,
      shippingCost: priced.shippingCost,
      discountAmount: priced.discountAmount,
      discountCode: priced.discountCode ?? null,
      total: priced.total,
      gateway: priced.gateway,
      isFreeShipping: priced.isFreeShipping,
      currency: priced.gateway === "flutterwave" ? "usd" : "ngn",
      chargeUsdCents: priced.chargeUsdCents,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to quote" },
      { status: 400 },
    );
  }
}
