import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ReviewsQueue } from "@/components/reviews-queue";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const items = await prisma.review.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      customer: { select: { name: true, email: true } },
    },
  });

  return (
    <>
      <AdminPageHeader title="Reviews" description="Approve or reject storefront reviews." />
      <ReviewsQueue
        status={status ?? ""}
        items={items.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          productName: r.product.name,
          productSlug: r.product.slug,
          customerName: r.customer.name,
          customerEmail: r.customer.email,
        }))}
      />
    </>
  );
}
