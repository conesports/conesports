import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CatalogPlp } from "@/components/catalog-plp";
import { getShopLeaf } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const leaf = getShopLeaf(category);
  let catName = leaf?.title;
  let intro = leaf?.intro;
  try {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      catName = cat.name;
      intro = cat.intro || intro;
    }
  } catch {
    /* no db */
  }
  if (!catName) return {};
  return pageMetadata({
    title: catName,
    description: intro || `Shop ${catName} at ConeSports.`,
    path: `/shop/${category}`,
  });
}

export default async function CategoryShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const leaf = getShopLeaf(category);
  let title = leaf?.title;
  let intro = leaf?.intro ?? "";
  try {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      title = cat.name;
      intro = cat.intro || intro;
    }
  } catch {
    /* no db */
  }
  if (!title) notFound();

  const sp = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  return (
    <CatalogPlp
      page={{
        slug: category,
        path: `/shop/${category}`,
        title,
        intro,
        kind: "leaf",
        categorySlugs: [category],
      }}
      searchParams={flat}
    />
  );
}
