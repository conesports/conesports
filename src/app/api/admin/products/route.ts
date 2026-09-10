import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseProductWrite } from "@/lib/validators";
import { revalidateCatalog } from "@/lib/revalidate-catalog";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const items = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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

  const existing = await prisma.product.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 409 },
    );
  }

  const product = await prisma.product.create({
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
      categories: { connect: body.categoryIds.map((id) => ({ id })) },
      variants: {
        create: body.variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          sku: v.sku,
        })),
      },
    },
    include: { categories: true, variants: true },
  });

  revalidateCatalog({
    productSlug: product.slug,
    categorySlugs: product.categories.map((c) => c.slug),
  });

  return NextResponse.json(product, { status: 201 });
}
