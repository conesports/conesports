import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { ReviewForm } from "@/components/review-form";
import { WishlistButton } from "@/components/wishlist-button";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.priceConfirmed) return {};
  return pageMetadata({
    title: product.name,
    description: product.description || `Shop ${product.name} at ConeSports.`,
    path: `/product/${product.slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, categories: true },
  });
  if (!product || !product.priceConfirmed) notFound();

  const [related, reviews, customer] = await Promise.all([
    prisma.product.findMany({
      where: {
        priceConfirmed: true,
        id: { not: product.id },
        categories: {
          some: { id: { in: product.categories.map((c) => c.id) } },
        },
      },
      take: 4,
    }),
    prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    session?.user?.id
      ? prisma.customer.findUnique({ where: { userId: session.user.id } })
      : null,
  ]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const canReview = customer
    ? Boolean(
        await prisma.orderItem.findFirst({
          where: {
            productId: product.id,
            order: {
              customerId: customer.id,
              status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
            },
          },
        }),
      )
    : false;

  return (
    <section>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          slug: product.slug,
          description: product.description,
          images: product.images,
          priceKobo: product.price,
          discountPercent: product.discountPercent,
          inStock: product.variants.some((v) => v.stock > 0),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          ...(product.categories[0]
            ? [{ name: product.categories[0].name, path: `/shop/${product.categories[0].slug}` }]
            : []),
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <ProductDetail
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          images: product.images,
          price: product.price,
          discountPercent: product.discountPercent,
          variants: product.variants,
        }}
      />
      <div className="mt-4">
        <WishlistButton productId={product.id} />
      </div>
      <div className="mt-10">
        <h2 className="mb-2 text-lg font-medium">Reviews</h2>
        <p className="mb-4 text-sm">
          {reviews.length
            ? `Average ${avg.toFixed(1)} / 5 (${reviews.length})`
            : "No reviews yet."}
        </p>
        <ul className="mb-6 space-y-3 text-sm">
          {reviews.map((r) => (
            <li key={r.id} className="border-b py-2">
              <p>
                {r.rating}/5 {r.title ? `· ${r.title}` : ""}
              </p>
              <p>{r.body}</p>
              <p className="text-zinc-500">{r.customer.name ?? "Customer"}</p>
            </li>
          ))}
        </ul>
        {canReview ? <ReviewForm productId={product.id} /> : null}
      </div>
      {related.length ? (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-medium">Related</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
