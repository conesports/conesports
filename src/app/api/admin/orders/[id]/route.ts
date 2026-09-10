import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { applyOrderStatus } from "@/lib/orders";
import { FULFILLMENT_STATUSES } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]).optional(),
  trackingNumber: z.string().nullable().optional(),
  carrier: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const status = (parsed.data.status ?? existing.status) as OrderStatus;
  if (!FULFILLMENT_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await applyOrderStatus(id, status, {
    trackingNumber: parsed.data.trackingNumber,
    carrier: parsed.data.carrier,
    adminNotes: parsed.data.adminNotes,
  });

  return NextResponse.json(order);
}
