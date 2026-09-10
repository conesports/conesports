import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ReorderButton } from "@/components/reorder-button";

const STEPS = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED"] as const;

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const order = session?.user?.id
    ? await prisma.order.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
      })
    : null;
  if (!order) notFound();

  const current = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Order {order.id.slice(-8).toUpperCase()}</h1>
      <p>{order.status} · {formatMoney(order.total, order.currency)}</p>
      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((step, i) => (
          <li key={step} className={i <= current ? "font-medium" : "text-zinc-500"}>
            {step}
            {i < STEPS.length - 1 ? " →" : ""}
          </li>
        ))}
      </ol>
      {order.trackingNumber ? (
        <p className="text-sm">
          Tracking {order.trackingNumber}
          {order.carrier ? ` via ${order.carrier}` : ""}
        </p>
      ) : null}
      <ul className="text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} ({item.size}
            {item.color ? ` / ${item.color}` : ""}) × {item.quantity} —{" "}
            {formatMoney(item.price * item.quantity, order.currency)}
          </li>
        ))}
      </ul>
      <p className="text-sm">Subtotal {formatMoney(order.subtotal, order.currency)}</p>
      <p className="text-sm">Shipping {formatMoney(order.shippingCost, order.currency)}</p>
      {order.discountAmount ? (
        <p className="text-sm">Discount {formatMoney(order.discountAmount, order.currency)}</p>
      ) : null}
      <div className="flex gap-3">
        <a href={`/api/account/orders/${order.id}/invoice`} className="border px-3 py-1 text-sm">
          Download invoice
        </a>
        <ReorderButton orderId={order.id} />
      </div>
    </section>
  );
}
