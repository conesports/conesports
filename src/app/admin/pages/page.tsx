import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { listSitePagesForAdmin } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await listSitePagesForAdmin();

  return (
    <>
      <AdminPageHeader title="Pages" description="Legal and about copy shown on the storefront." />
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Page</th>
            <th className="border-b py-2">URL</th>
            <th className="border-b py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.slug}>
              <td className="border-b py-2">
                <Link href={`/admin/pages/${page.slug}`}>{page.label}</Link>
              </td>
              <td className="border-b py-2">{page.path}</td>
              <td className="border-b py-2">{page.hasOverride ? "Custom" : "Default"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
