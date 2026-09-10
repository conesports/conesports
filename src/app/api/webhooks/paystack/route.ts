import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSetting } from "@/lib/settings";
import { confirmPaystackPayment } from "@/lib/orders";

function signaturesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const secret = (await getSetting("paystack_secret_key")).trim();
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  if (!signaturesMatch(signature, expected)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: { reference?: string; metadata?: { orderId?: string } };
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true, ignored: payload.event });
  }

  const reference = payload.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const result = await confirmPaystackPayment({
    reference,
    expectedOrderId: payload.data?.metadata?.orderId ?? null,
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
