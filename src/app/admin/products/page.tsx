import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminCard, AdminPageHeader } from "@/components/admin-page-header";
import { formatNgn } from "@/lib/money";

export const dynamic = "force-dynamic";

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
    <div className="space-y-5">
      <AdminPageHeader
        title="Products"
        description={`${products.length} in catalog`}
        actions={
          <Link href="/admin/products/new" className="btn-solid rounded-xl">
            New product
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={onlyUnconfirmed ? "/admin/products" : "/admin/products?unconfirmed=1"}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold tracking-[0.12em] uppercase transition hover:border-zinc-400"
        >
          {onlyUnconfirmed ? "Show all" : "Unconfirmed prices"}
        </Link>
      </div>

      {products.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-zinc-500">
            No products yet. Run{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
              npm run db:seed-demo
            </code>{" "}
            or create one with New product.
          </p>
        </AdminCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            const image = p.images[0];
            return (
              <li key={p.id}>
                <AdminCard className="admin-card--flush overflow-hidden">
                  <div className="aspect-[4/3] bg-zinc-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold tracking-[0.14em] text-zinc-400 uppercase">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold tracking-tight text-zinc-950">
                          {p.name}
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">{p.slug}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold">{formatNgn(p.price)}</p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {p.categories.map((c) => c.name).join(", ") || "Uncategorized"}
                      {" · "}
                      {stock} in stock
                      {!p.priceConfirmed ? " · Price unconfirmed" : ""}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="btn-solid rounded-xl px-3 py-2 text-[11px]"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/product/${p.slug}`}
                        className="rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition hover:border-zinc-400"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </AdminCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
