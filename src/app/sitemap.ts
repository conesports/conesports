import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { prisma } from "@/lib/prisma";
import { SITE_PAGES } from "@/lib/site-pages";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/shop",
    "/faq",
    "/contact",
    "/blog",
    ...SITE_PAGES.map((p) => p.path),
    ...BLOG_POSTS.map((post) => `/blog/${post.slug}`),
  ];

  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { priceConfirmed: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
  } catch {
    products = [];
    categories = [];
  }

  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/shop/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
