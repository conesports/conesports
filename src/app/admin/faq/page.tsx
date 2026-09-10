import { AdminPageHeader } from "@/components/admin-page-header";
import { FaqEditor } from "@/components/faq-editor";
import { getFaqItems } from "@/lib/faq";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const items = await getFaqItems();

  return (
    <>
      <AdminPageHeader title="FAQ" description="Questions shown on /faq." />
      <FaqEditor initial={items} />
    </>
  );
}
