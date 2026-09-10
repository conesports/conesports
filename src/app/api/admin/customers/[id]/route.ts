import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const patchSchema = z.object({
  notes: z.string().nullable().optional(),
  marketingOptIn: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      notes: parsed.data.notes,
      marketingOptIn: parsed.data.marketingOptIn,
    },
  });
  return NextResponse.json(customer);
}
