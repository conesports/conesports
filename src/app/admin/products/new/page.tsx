import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <AdminPageHeader
        title="New product"
        description="Add kit to the ConeSports catalog. Prices in naira."
        actions={
          <Link
            href="/admin/products"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold tracking-[0.12em] uppercase transition hover:border-zinc-400"
          >
            Product list
          </Link>
        }
      />
      <ProductForm categories={categories} />
    </>
  );
}
