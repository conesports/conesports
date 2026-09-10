import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  label: z.string().optional(),
  line1: z.string().trim().min(1).optional(),
  line2: z.string().optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().optional(),
  country: z.string().trim().min(2).optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

async function ownedAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) return null;
  return prisma.address.findFirst({
    where: { id, customerId: customer.id },
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = await ownedAddress(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { customerId: existing.customerId },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(address);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = await ownedAddress(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ id });
}
