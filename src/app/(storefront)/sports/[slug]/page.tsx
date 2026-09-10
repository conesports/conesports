import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPlp } from "@/components/catalog-plp";
import { getSportPage } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSportPage(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.intro,
    path: page.path,
  });
}

export default async function SportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = getSportPage(slug);
  if (!page) notFound();
  const sp = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  return <CatalogPlp page={page} searchParams={flat} />;
}
