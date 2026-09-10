import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePriceKobo } from "@/lib/money";
import { z } from "zod";

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

function serializeLine(item: {
  quantity: number;
  variant: {
    id: string;
    size: string;
    color: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      price: number;
      discountPercent: number;
    };
  };
}) {
  const product = item.variant.product;
  return {
    productId: product.id,
    variantId: item.variant.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0] ?? "",
    price: effectivePriceKobo(product.price, product.discountPercent),
    listPrice: product.price,
    discountPercent: product.discountPercent,
    size: item.variant.size,
    color: item.variant.color,
    quantity: item.quantity,
  };
}

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;

  const items = await prisma.cartItem.findMany({
    where: { userId: userId! },
    include: { variant: { include: { product: true } } },
  });

  return NextResponse.json({ items: items.map(serializeLine) });
}

const writeSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).optional(),
});

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = writeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const variant = await prisma.variant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: true },
  });
  if (!variant || !variant.product.priceConfirmed) {
    return NextResponse.json({ error: "Variant not available" }, { status: 404 });
  }

  const quantity = parsed.data.quantity ?? 1;
  const item = await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: userId!, variantId: variant.id } },
    create: {
      userId: userId!,
      productId: variant.productId,
      variantId: variant.id,
      quantity,
    },
    update: { quantity: { increment: quantity } },
    include: { variant: { include: { product: true } } },
  });

  return NextResponse.json(serializeLine(item));
}

export async function PATCH(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = writeSchema.extend({ quantity: z.coerce.number().int() }).safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: userId!, variantId: parsed.data.variantId },
    });
    return NextResponse.json({ ok: true });
  }

  const item = await prisma.cartItem.update({
    where: { userId_variantId: { userId: userId!, variantId: parsed.data.variantId } },
    data: { quantity: parsed.data.quantity },
    include: { variant: { include: { product: true } } },
  });

  return NextResponse.json(serializeLine(item));
}

export async function DELETE(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const url = new URL(req.url);
  const variantId = url.searchParams.get("variantId");

  await prisma.cartItem.deleteMany({
    where: variantId
      ? { userId: userId!, variantId }
      : { userId: userId! },
  });
  return NextResponse.json({ ok: true });
}
