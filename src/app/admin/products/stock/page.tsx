import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { StockGrid } from "@/components/stock-grid";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Edit variant stock and save in one request."
      />
      <StockGrid
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          variants: p.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
          })),
        }))}
      />
    </>
  );
}
