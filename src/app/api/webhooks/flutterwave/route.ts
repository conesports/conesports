import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { flutterwaveWebhookHash } from "@/lib/flutterwave";
import { confirmFlutterwavePayment } from "@/lib/orders";

function hashesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const expected = await flutterwaveWebhookHash();
  if (!expected) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const hash = req.headers.get("verif-hash");
  if (!hash || !hashesMatch(hash, expected)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: { tx_ref?: string; meta?: { orderId?: string } };
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event && !payload.event.includes("charge")) {
    return NextResponse.json({ received: true, ignored: payload.event });
  }

  const reference = payload.data?.tx_ref;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const result = await confirmFlutterwavePayment({
    reference,
    expectedOrderId: payload.data?.meta?.orderId ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    received: true,
    orderId: result.orderId,
    alreadyPaid: result.alreadyPaid,
  });
}
