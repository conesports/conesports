import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPlp } from "@/components/catalog-plp";
import { getHubPage } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

function flatten(
  sp: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
}

export function hubMetadata(slug: string): () => Promise<Metadata> {
  return async () => {
    const page = getHubPage(slug);
    if (!page) return {};
    return pageMetadata({
      title: page.title,
      description: page.intro,
      path: page.path,
    });
  };
}

export async function HubPage({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const page = getHubPage(slug);
  if (!page) notFound();
  const sp = await searchParams;
  return <CatalogPlp page={page} searchParams={flatten(sp)} />;
}
