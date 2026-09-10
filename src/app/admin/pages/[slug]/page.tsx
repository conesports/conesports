import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { SitePageEditor } from "@/components/site-page-editor";
import { getResolvedSitePage, getSitePageDefinition } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export default async function AdminSitePageEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getSitePageDefinition(slug);
  const page = await getResolvedSitePage(slug);
  if (!def || !page) notFound();

  return (
    <>
      <AdminPageHeader title={def.label} description={def.path} />
      <SitePageEditor
        slug={slug}
        title={page.title}
        metaDescription={page.metaDescription}
        bodyHtml={page.bodyHtml}
      />
    </>
  );
}
