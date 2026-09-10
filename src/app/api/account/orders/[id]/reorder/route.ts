import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePriceKobo } from "@/lib/money";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = [];
  for (const line of order.items) {
    const variant = line.variant;
    if (!variant || variant.stock <= 0 || !variant.product.priceConfirmed) continue;
    await prisma.cartItem.upsert({
      where: { userId_variantId: { userId: session.user.id, variantId: variant.id } },
      create: {
        userId: session.user.id,
        productId: variant.productId,
        variantId: variant.id,
        quantity: Math.min(line.quantity, variant.stock),
      },
      update: { quantity: { increment: Math.min(line.quantity, variant.stock) } },
    });
    items.push({
      productId: variant.product.id,
      variantId: variant.id,
      name: variant.product.name,
      slug: variant.product.slug,
      image: variant.product.images[0] ?? "",
      price: effectivePriceKobo(variant.product.price, variant.product.discountPercent),
      listPrice: variant.product.price,
      discountPercent: variant.product.discountPercent,
      size: variant.size,
      color: variant.color,
      quantity: Math.min(line.quantity, variant.stock),
    });
  }

  return NextResponse.json({ items });
}
