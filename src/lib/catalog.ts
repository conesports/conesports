import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 24;

export type ShopFilters = {
  category?: string;
  categories?: string[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
};

function sortBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "popularity":
      return [{ bestSeller: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function queryShopProducts(filters: ShopFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.ProductWhereInput = {
    priceConfirmed: true,
  };

  if (filters.category) {
    where.categories = { some: { slug: filters.category } };
  } else if (filters.categories?.length) {
    where.categories = { some: { slug: { in: filters.categories } } };
  }
  if (filters.onSale) {
    where.discountPercent = { gt: 0 };
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.size || filters.color || filters.inStock) {
    where.variants = {
      some: {
        ...(filters.size ? { size: filters.size } : {}),
        ...(filters.color ? { color: filters.color } : {}),
        ...(filters.inStock ? { stock: { gt: 0 } } : {}),
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sortBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        categories: true,
        variants: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function shopFacets(categorySlug?: string) {
  const products = await prisma.product.findMany({
    where: {
      priceConfirmed: true,
      ...(categorySlug
        ? { categories: { some: { slug: categorySlug } } }
        : {}),
    },
    include: { variants: true, categories: true },
  });

  const sizes = new Set<string>();
  const colors = new Set<string>();
  for (const p of products) {
    for (const v of p.variants) {
      if (v.size) sizes.add(v.size);
      if (v.color) colors.add(v.color);
    }
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return {
    sizes: [...sizes].sort(),
    colors: [...colors].sort(),
    categories,
  };
}
