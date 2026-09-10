import { AdminPageHeader } from "@/components/admin-page-header";
import { FooterLinksEditor } from "@/components/footer-links-editor";
import { getFooterLinks } from "@/lib/site-links";

export const dynamic = "force-dynamic";

export default async function AdminFooterLinksPage() {
  const links = await getFooterLinks();

  return (
    <>
      <AdminPageHeader
        title="Footer links"
        description="Each group needs at least one link."
      />
      <FooterLinksEditor initial={links} />
    </>
  );
}
