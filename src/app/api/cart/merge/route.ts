import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePriceKobo } from "@/lib/money";

const mergeSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.coerce.number().int().min(1).max(99),
    }),
  ),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mergeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const line of parsed.data.items) {
    const variant = await prisma.variant.findUnique({
      where: { id: line.variantId },
    });
    if (!variant) continue;
    await prisma.cartItem.upsert({
      where: {
        userId_variantId: { userId: session.user.id, variantId: variant.id },
      },
      create: {
        userId: session.user.id,
        productId: variant.productId,
        variantId: variant.id,
        quantity: line.quantity,
      },
      update: { quantity: { increment: line.quantity } },
    });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { variant: { include: { product: true } } },
  });

  return NextResponse.json({
    items: items.map((item) => {
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
    }),
  });
}
