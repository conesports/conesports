import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ProductForm } from "@/components/product-form";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: true, variants: true },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title={`Edit ${product.name}`}
        actions={<DeleteProductButton id={product.id} />}
      />
      <ProductForm
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          priceUSD: product.priceUSD,
          discountPercent: product.discountPercent,
          images: product.images,
          featured: product.featured,
          bestSeller: product.bestSeller,
          priceConfirmed: product.priceConfirmed,
          categoryIds: product.categories.map((c) => c.id),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
          })),
        }}
      />
    </>
  );
}
