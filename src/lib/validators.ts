import { z } from "zod";
import { clampDiscountPercent, nairaToKobo, slugify, variantSku } from "@/lib/money";

export const variantInputSchema = z.object({
  id: z.string().optional(),
  size: z.string().trim().min(1),
  color: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(80),
  description: z.string().default(""),
  price: z.coerce.number().min(0),
  priceUSD: z.coerce.number().min(0).nullable().optional(),
  discountPercent: z.coerce.number().int().min(0).max(100).optional(),
  images: z.array(z.string().min(1)).default([]),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  priceConfirmed: z.boolean().optional(),
  categoryIds: z.array(z.string()).default([]),
  variants: z.array(variantInputSchema).default([]),
});

export function parseProductWrite(raw: unknown) {
  const parsed = productWriteSchema.safeParse(raw);
  if (!parsed.success) return null;
  const data = parsed.data;
  const slug = slugify(data.slug) || slugify(data.name);
  return {
    name: data.name.trim(),
    slug,
    description: data.description,
    price: nairaToKobo(data.price),
    priceUSD: data.priceUSD ?? null,
    discountPercent: clampDiscountPercent(data.discountPercent ?? 0),
    images: data.images,
    featured: Boolean(data.featured),
    bestSeller: Boolean(data.bestSeller),
    priceConfirmed: Boolean(data.priceConfirmed),
    categoryIds: data.categoryIds,
    variants: data.variants.map((v) => ({
      id: v.id,
      size: v.size.trim(),
      color: v.color.trim(),
      stock: v.stock,
      sku: variantSku(slug, v.size, v.color),
    })),
  };
}

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  intro: z.string().default(""),
  sortOrder: z.coerce.number().int().optional(),
});
