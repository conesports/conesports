import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { OrderFulfillmentForm } from "@/components/order-fulfillment-form";
import { formatNgn } from "@/lib/money";

export const dynamic = "force-dynamic";

type ShippingSnapshot = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const shipping = (order.shippingAddress ?? {}) as ShippingSnapshot;

  return (
    <>
      <AdminPageHeader
        title={`Order ${order.id.slice(-8).toUpperCase()}`}
        description={`${order.status} · ${order.gateway ?? "no gateway"}`}
      />
      <section className="mb-6 text-sm">
        <h2 className="mb-2 font-medium">Customer</h2>
        <p>{order.customer?.name ?? shipping.name ?? "—"}</p>
        <p>{order.email}</p>
        <p>{order.phone ?? shipping.phone ?? "—"}</p>
      </section>
      <section className="mb-6 text-sm">
        <h2 className="mb-2 font-medium">Shipping address</h2>
        <p>{shipping.name}</p>
        <p>{shipping.line1}</p>
        {shipping.line2 ? <p>{shipping.line2}</p> : null}
        <p>
          {[shipping.city, shipping.state, shipping.postalCode]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p>{shipping.country}</p>
      </section>
      <section className="mb-6 text-sm">
        <h2 className="mb-2 font-medium">Line items</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b py-2">Item</th>
              <th className="border-b py-2">Qty</th>
              <th className="border-b py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="border-b py-2">
                  {item.name} ({item.size}
                  {item.color ? ` / ${item.color}` : ""})
                </td>
                <td className="border-b py-2">{item.quantity}</td>
                <td className="border-b py-2">{formatNgn(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">Subtotal {formatNgn(order.subtotal)}</p>
        <p>Shipping {formatNgn(order.shippingCost)}</p>
        <p>Discount {formatNgn(order.discountAmount)}</p>
        <p>Total {formatNgn(order.total)}</p>
      </section>
      <OrderFulfillmentForm
        orderId={order.id}
        status={order.status}
        trackingNumber={order.trackingNumber}
        carrier={order.carrier}
        adminNotes={order.adminNotes}
      />
    </>
  );
}
