import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseProductWrite } from "@/lib/validators";
import { revalidateCatalog } from "@/lib/revalidate-catalog";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true, variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = parseProductWrite(raw);
  if (!body) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, categories: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slugTaken = await prisma.product.findFirst({
    where: { slug: body.slug, NOT: { id } },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 409 },
    );
  }

  const incomingIds = new Set(
    body.variants.map((v) => v.id).filter((v): v is string => Boolean(v)),
  );
  const toDelete = existing.variants.filter((v) => !incomingIds.has(v.id));

  if (toDelete.length) {
    const inOrders = await prisma.orderItem.count({
      where: { variantId: { in: toDelete.map((v) => v.id) } },
    });
    if (inOrders > 0) {
      return NextResponse.json(
        { error: "Cannot remove variants that appear on past orders" },
        { status: 409 },
      );
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.cartItem.deleteMany({
        where: { variantId: { in: toDelete.map((v) => v.id) } },
      });
      await tx.variant.deleteMany({
        where: { id: { in: toDelete.map((v) => v.id) } },
      });
    }

    for (const v of body.variants) {
      if (v.id) {
        await tx.variant.update({
          where: { id: v.id },
          data: { size: v.size, color: v.color, stock: v.stock, sku: v.sku },
        });
      } else {
        await tx.variant.create({
          data: {
            productId: id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku,
          },
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        priceUSD: body.priceUSD,
        discountPercent: body.discountPercent,
        images: body.images,
        featured: body.featured,
        bestSeller: body.bestSeller,
        priceConfirmed: body.priceConfirmed,
        categories: { set: body.categoryIds.map((cid) => ({ id: cid })) },
      },
      include: { categories: true, variants: true },
    });
  });

  revalidateCatalog({
    productSlug: product.slug,
    categorySlugs: [
      ...existing.categories.map((c) => c.slug),
      ...product.categories.map((c) => c.slug),
    ],
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ordered = await prisma.orderItem.count({ where: { productId: id } });
  if (ordered > 0) {
    return NextResponse.json(
      { error: "Cannot delete a product that appears on orders" },
      { status: 409 },
    );
  }

  await prisma.product.delete({ where: { id } });

  revalidateCatalog({
    productSlug: existing.slug,
    categorySlugs: existing.categories.map((c) => c.slug),
  });

  return NextResponse.json({ id });
}
