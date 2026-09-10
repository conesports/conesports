import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { CategoriesEditor } from "@/components/categories-editor";

export default async function AdminCategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <AdminPageHeader title="Categories" />
      <CategoriesEditor
        initial={rows.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          intro: c.intro,
          sortOrder: c.sortOrder,
          productCount: c._count.products,
        }))}
      />
    </>
  );
}
