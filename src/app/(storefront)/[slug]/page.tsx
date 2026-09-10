import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResolvedSitePage, getSitePageDefinition } from "@/lib/site-pages";
import { sanitizeSitePageHtml } from "@/lib/site-page-html";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getResolvedSitePage(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.metaDescription || page.title,
    path: `/${slug}`,
  });
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getSitePageDefinition(slug)) notFound();
  const page = await getResolvedSitePage(slug);
  if (!page) notFound();

  return (
    <article className="prose-cms max-w-3xl space-y-4 text-sm">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: page.title, path: `/${slug}` },
        ])}
      />
      <h1 className="text-2xl font-semibold">{page.title}</h1>
      <div
        className="[&_a]:underline [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-medium [&_h3]:mt-4 [&_h3]:font-medium [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: sanitizeSitePageHtml(page.bodyHtml) }}
      />
    </article>
  );
}
