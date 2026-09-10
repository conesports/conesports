import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { formatNgn } from "@/lib/money";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ unconfirmed?: string }>;
}) {
  const { unconfirmed } = await searchParams;
  const onlyUnconfirmed = unconfirmed === "1";

  const products = await prisma.product.findMany({
    where: onlyUnconfirmed ? { priceConfirmed: false } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      categories: true,
      variants: { select: { stock: true } },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Catalog"
        actions={
          <Link href="/admin/products/new" className="btn-black">
            New product
          </Link>
        }
      />
      <p className="mb-3 text-sm">
        <Link href={onlyUnconfirmed ? "/admin/products" : "/admin/products?unconfirmed=1"}>
          {onlyUnconfirmed ? "Show all" : "Show unconfirmed prices"}
        </Link>
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Name</th>
            <th className="border-b py-2">Slug</th>
            <th className="border-b py-2">Price</th>
            <th className="border-b py-2">Categories</th>
            <th className="border-b py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border-b py-2">
                <Link href={`/admin/products/${p.id}/edit`}>{p.name}</Link>
                {!p.priceConfirmed ? " (unconfirmed)" : ""}
              </td>
              <td className="border-b py-2">{p.slug}</td>
              <td className="border-b py-2">{formatNgn(p.price)}</td>
              <td className="border-b py-2">
                {p.categories.map((c) => c.name).join(", ") || "—"}
              </td>
              <td className="border-b py-2">
                {p.variants.reduce((sum, v) => sum + v.stock, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
