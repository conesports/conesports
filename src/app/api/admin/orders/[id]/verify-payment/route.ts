import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { confirmPaymentForOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!order.paymentReference) {
    return NextResponse.json(
      { error: "Order has no payment reference" },
      { status: 400 },
    );
  }

  const result = await confirmPaymentForOrder({
    id: order.id,
    gateway: order.gateway,
    paymentReference: order.paymentReference,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const updated = await prisma.order.findUnique({ where: { id } });
  return NextResponse.json(updated);
}
