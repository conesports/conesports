import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertCheckoutCustomer } from "@/lib/customer";

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().trim().min(1),
  line2: z.string().optional(),
  city: z.string().trim().min(1),
  state: z.string().optional(),
  country: z.string().trim().min(2),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

async function customerForUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), customer: null };
  }
  const customer = await upsertCheckoutCustomer({
    userId: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email,
  });
  return { customer, error: null };
}

export async function GET() {
  const { customer, error } = await customerForUser();
  if (error) return error;
  const items = await prisma.address.findMany({
    where: { customerId: customer!.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { customer, error } = await customerForUser();
  if (error) return error;
  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { customerId: customer!.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.create({
    data: { ...parsed.data, customerId: customer!.id },
  });
  return NextResponse.json(address, { status: 201 });
}
