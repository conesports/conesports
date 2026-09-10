import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const writeSchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  type: z.enum(["PERCENT", "FIXED"]).optional(),
  value: z.coerce.number().int().min(0).optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).nullable().optional(),
  minOrderValue: z.coerce.number().min(0).optional(),
  active: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = writeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid discount data" }, { status: 400 });
  }
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const type = parsed.data.type ?? existing.type;
  const discount = await prisma.discount.update({
    where: { id },
    data: {
      ...(parsed.data.code ? { code: parsed.data.code.toUpperCase() } : {}),
      type,
      ...(parsed.data.value != null
        ? { value: type === "PERCENT" ? Math.min(100, parsed.data.value) : Math.round(parsed.data.value * 100) }
        : {}),
      expiresAt:
        parsed.data.expiresAt === undefined
          ? undefined
          : parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt)
            : null,
      usageLimit:
        parsed.data.usageLimit === undefined ? undefined : parsed.data.usageLimit,
      ...(parsed.data.minOrderValue != null
        ? { minOrderValue: Math.round(parsed.data.minOrderValue * 100) }
        : {}),
      active: parsed.data.active,
    },
  });
  return NextResponse.json(discount);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  await prisma.discount.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ id });
}
