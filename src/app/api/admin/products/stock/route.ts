import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const stockSchema = z.object({
  updates: z.array(
    z.object({
      variantId: z.string().min(1),
      stock: z.coerce.number().int().min(0),
    }),
  ).min(1),
});

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = stockSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stock payload" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.updates.map((row) =>
      prisma.variant.update({
        where: { id: row.variantId },
        data: { stock: row.stock },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
