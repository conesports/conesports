import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getIdleCartMinutes, idleCartCutoff } from "@/lib/settings";
import { formatNgn } from "@/lib/money";
import { AbandonedCartsList } from "@/components/abandoned-carts-list";

export const dynamic = "force-dynamic";

export default async function AdminAbandonedCartsPage() {
  const idleMinutes = await getIdleCartMinutes();
  const cutoff = idleCartCutoff(idleMinutes);
  const carts = await prisma.abandonedCart.findMany({
    where: {
      recoveredAt: null,
      updatedAt: { lte: cutoff },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        title="Abandoned carts"
        description={`Idle threshold ${idleMinutes} minutes (store setting idle_cart_minutes). Recovered carts are hidden.`}
      />
      <AbandonedCartsList
        items={carts.map((c) => ({
          id: c.id,
          sessionId: c.sessionId,
          email: c.email,
          phone: c.phone,
          itemCount: c.itemCount,
          subtotal: formatNgn(c.subtotal),
          updatedAt: c.updatedAt.toISOString(),
          contactedAt: c.contactedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
