import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { formatNgn } from "@/lib/money";
import { FULFILLMENT_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  const take = 50;
  const currentPage = Math.max(1, Number(page) || 1);
  const where = status
    ? { status: status as OrderStatus }
    : undefined;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * take,
      take,
      include: {
        customer: true,
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <>
      <AdminPageHeader title="Orders" />
      <form className="mb-4 text-sm">
        <label>
          Status{" "}
          <select name="status" defaultValue={status ?? ""} className="border px-2 py-1">
            <option value="">All</option>
            {FULFILLMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>{" "}
        <button type="submit" className="border px-2 py-1">
          Filter
        </button>
      </form>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Customer</th>
            <th className="border-b py-2">Date</th>
            <th className="border-b py-2">Gateway</th>
            <th className="border-b py-2">Total</th>
            <th className="border-b py-2">Tracking</th>
            <th className="border-b py-2">Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border-b py-2">
                <Link href={`/admin/orders/${order.id}`}>
                  {order.customer?.name ?? "—"}
                  <br />
                  {order.email}
                  <br />
                  {order.phone ?? "—"}
                </Link>
              </td>
              <td className="border-b py-2">
                {order.createdAt.toISOString().slice(0, 10)}
              </td>
              <td className="border-b py-2">{order.gateway ?? "—"}</td>
              <td className="border-b py-2">{formatNgn(order.total)}</td>
              <td className="border-b py-2">{order.trackingNumber ?? "—"}</td>
              <td className="border-b py-2">{order.items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 ? (
        <p className="mt-4 text-sm">
          Page {currentPage} of {pages}
          {currentPage < pages ? (
            <>
              {" "}
              <Link href={`/admin/orders?page=${currentPage + 1}${status ? `&status=${status}` : ""}`}>
                Next
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </>
  );
}
