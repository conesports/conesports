import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { DiscountsEditor } from "@/components/discounts-editor";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const items = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return (
    <>
      <AdminPageHeader title="Discounts" description="Codes are validated server-side at checkout." />
      <DiscountsEditor
        initial={items.map((d) => ({
          id: d.id,
          code: d.code,
          type: d.type,
          value: d.value,
          expiresAt: d.expiresAt?.toISOString() ?? null,
          usageLimit: d.usageLimit,
          usageCount: d.usageCount,
          minOrderValue: d.minOrderValue,
          active: d.active,
          redemptionCount: d._count.redemptions,
        }))}
      />
    </>
  );
}
