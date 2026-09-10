import { AdminPageHeader } from "@/components/admin-page-header";
import { HomepageEditor } from "@/components/homepage-editor";
import {
  getHomepageContent,
  getHomepageOverrides,
  overrideFlags,
} from "@/lib/homepage-content";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [content, { overrides }] = await Promise.all([
    getHomepageContent(),
    getHomepageOverrides(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Homepage"
        description="Edit each section. Restore returns that section to the ConeSports default copy."
      />
      <HomepageEditor initial={content} overridden={overrideFlags(overrides)} />
    </>
  );
}
