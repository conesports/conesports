import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      userId: null as string | null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.id, error: null };
}

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;
  const items = await prisma.wishlistItem.findMany({
    where: { userId: userId! },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

const writeSchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const parsed = writeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: userId!, productId: parsed.data.productId } },
    create: { userId: userId!, productId: parsed.data.productId },
    update: {},
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  await prisma.wishlistItem.deleteMany({
    where: { userId: userId!, productId },
  });
  return NextResponse.json({ ok: true });
}
