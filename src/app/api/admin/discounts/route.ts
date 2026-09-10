import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const writeSchema = z.object({
  code: z.string().trim().min(1).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().int().min(0),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).nullable().optional(),
  minOrderValue: z.coerce.number().min(0).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const items = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = writeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid discount data" }, { status: 400 });
  }
  const code = parsed.data.code.toUpperCase();
  const existing = await prisma.discount.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }
  const discount = await prisma.discount.create({
    data: {
      code,
      type: parsed.data.type,
      value: parsed.data.type === "PERCENT"
        ? Math.min(100, parsed.data.value)
        : Math.round(parsed.data.value * 100),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      usageLimit: parsed.data.usageLimit ?? null,
      minOrderValue: Math.round((parsed.data.minOrderValue ?? 0) * 100),
      active: parsed.data.active ?? true,
    },
  });
  return NextResponse.json(discount, { status: 201 });
}
