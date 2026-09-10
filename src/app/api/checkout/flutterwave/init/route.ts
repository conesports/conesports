import { NextResponse } from "next/server";
import { checkoutBodySchema } from "@/lib/checkout-schema";
import { startCheckout } from "@/lib/checkout";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = await rateLimitResponse(req, "checkout");
  if (limited) return limited;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = checkoutBodySchema.safeParse(
    raw && typeof raw === "object" ? { ...raw, gateway: "flutterwave" } : raw,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }
  try {
    return NextResponse.json(
      await startCheckout({ ...parsed.data, gateway: "flutterwave" }),
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to start payment" },
      { status: 400 },
    );
  }
}
