import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminCard, AdminPageHeader } from "@/components/admin-page-header";
import type { DashboardSnapshot } from "@/lib/admin-dashboard";
import { formatLagosDateTime, formatLagosNow, gatewayLabel, orderStatusLabel } from "@/lib/admin-format";
import { formatNgn } from "@/lib/money";

function Kpi({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="admin-label text-zinc-400">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="admin-card block transition hover:border-zinc-300">
      {body}
    </Link>
  ) : (
    <div className="admin-card">{body}</div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export function AdminDashboardView({ data }: { data: DashboardSnapshot }) {
  const maxRevenue = Math.max(1, ...data.series.map((day) => day.revenue));
  const statusTotal = data.statusCounts.reduce((sum, row) => sum + row.count, 0) || 1;

  return (
    <div className="space-y-5 md:space-y-6">
      <AdminPageHeader
        title="House overview"
        description={`${formatLagosNow()}${data.available ? "" : " · Database offline"}`}
        actions={
          <>
            <Link
              href="/"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold tracking-[0.12em] uppercase transition hover:border-zinc-400"
            >
              View store
            </Link>
            <Link href="/admin/products/new" className="btn-solid rounded-xl">
              New product
            </Link>
          </>
        }
      />

      {data.alerts.length ? (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-[var(--club)] px-4 py-4">
          {data.alerts.map((alert) => (
            <Link
              key={alert.label}
              href={alert.href}
              className="rounded-xl bg-white px-3 py-2 text-[11px] font-bold tracking-[0.12em] text-black uppercase"
            >
              {alert.count} {alert.label}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--club)] px-4 py-3 text-[11px] font-bold tracking-[0.14em] text-white/80 uppercase">
          All clear · No queues waiting
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Paid revenue · 30 days"
          value={formatNgn(data.revenue30d)}
          hint={`${formatNgn(data.revenueAll)} all time`}
          href="/admin/orders"
        />
        <Kpi
          label="Orders · 30 days"
          value={String(data.orders30d)}
          hint={`${data.ordersToday} today · ${data.orders} lifetime`}
          href="/admin/orders"
        />
        <Kpi
          label="Average order · 30 days"
          value={data.aov30d ? formatNgn(data.aov30d) : "—"}
          hint={`${formatNgn(data.revenue7d)} last 7 days`}
        />
        <Kpi
          label="Customers"
          value={String(data.customers)}
          hint={`${data.abandonedCarts} idle carts after ${data.idleMinutes} min`}
          href="/admin/customers"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Pending payment" value={String(data.pendingPayment)} href="/admin/orders?status=PENDING" />
        <Kpi label="Paid / in progress" value={String(data.paidInProgress)} href="/admin/orders" />
        <Kpi label="Delivered" value={String(data.delivered)} href="/admin/orders?status=DELIVERED" />
        <Kpi label="Price pending" value={String(data.pricePending)} href="/admin/products?unconfirmed=1" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="admin-label text-zinc-400">Paid sales</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">Last 14 days</h2>
            </div>
            <p className="text-sm text-zinc-500">{formatNgn(data.revenueToday)} today</p>
          </div>
          <div className="flex h-44 items-end gap-1.5">
            {data.series.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-black"
                  style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                  title={`${day.label}: ${formatNgn(day.revenue)} · ${day.orders} orders`}
                />
                <span className="hidden text-[9px] tracking-wide text-zinc-400 uppercase sm:block">
                  {day.label.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Order status">
          {data.statusCounts.length ? (
            <ul className="space-y-3">
              {data.statusCounts.map((row) => (
                <li key={row.status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{orderStatusLabel(row.status)}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: `${(row.count / statusTotal) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No orders yet.</Empty>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard title="Catalog">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="admin-label text-zinc-400">Products</dt>
              <dd className="mt-1 text-xl font-bold">{data.products}</dd>
            </div>
            <div>
              <dt className="admin-label text-zinc-400">SKUs</dt>
              <dd className="mt-1 text-xl font-bold">{data.variants}</dd>
            </div>
            <div>
              <dt className="admin-label text-zinc-400">Categories</dt>
              <dd className="mt-1 text-xl font-bold">{data.categories}</dd>
            </div>
            <div>
              <dt className="admin-label text-zinc-400">Active discounts</dt>
              <dd className="mt-1 text-xl font-bold">{data.activeDiscounts}</dd>
            </div>
          </dl>
          <p className="mt-5">
            <Link href="/admin/products" className="text-sm font-semibold text-zinc-700 hover:text-black">
              Manage catalog →
            </Link>
          </p>
        </AdminCard>

        <AdminCard title="Payments">
          {data.gateways.length ? (
            <ul className="space-y-3 text-sm">
              {data.gateways.map((row) => (
                <li key={row.gateway} className="flex items-center justify-between">
                  <span>{gatewayLabel(row.gateway)}</span>
                  <span className="font-medium">
                    {row.count} · {formatNgn(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No paid gateway volume yet.</Empty>
          )}
          <p className="mt-5">
            <Link href="/admin/settings" className="text-sm font-semibold text-zinc-700 hover:text-black">
              Payment settings →
            </Link>
          </p>
        </AdminCard>

        <AdminCard title="Quick links">
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {[
              ["/admin/orders", "Orders"],
              ["/admin/products", "Products"],
              ["/admin/products/stock", "Inventory"],
              ["/admin/homepage", "Homepage CMS"],
              ["/admin/shipping", "Shipping"],
              ["/admin/settings", "Settings"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-xl border border-zinc-200 px-3 py-2.5 transition hover:border-zinc-400"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="admin-card-title mb-0">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-zinc-600 hover:text-black">
            Open →
          </Link>
        </div>
        {data.recentOrders.length ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>When</th>
                  <th>Gateway</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium">
                        {order.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{order.email}</p>
                      <p className="text-xs text-zinc-500">{order.phone ?? "—"}</p>
                    </td>
                    <td>{formatLagosDateTime(order.createdAt)}</td>
                    <td>{gatewayLabel(order.gateway)}</td>
                    <td>
                      <AdminStatusBadge status={order.status} />
                    </td>
                    <td>{order.itemCount}</td>
                    <td className="font-medium">{formatNgn(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No orders yet. Paid totals stay in naira (kobo in the database).</Empty>
        )}
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="admin-card-title mb-0">Low stock</h2>
            <Link href="/admin/products/stock" className="text-sm font-semibold text-zinc-600 hover:text-black">
              Open →
            </Link>
          </div>
          {data.lowStockRows.length ? (
            <ul className="space-y-3 text-sm">
              {data.lowStockRows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/products/${row.productId}/edit`} className="font-medium">
                      {row.productName}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {row.size}
                      {row.color ? ` · ${row.color}` : ""} · {row.sku}
                    </p>
                  </div>
                  <span className={`font-bold ${row.stock === 0 ? "text-red-700" : "text-amber-800"}`}>
                    {row.stock}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No SKUs at 5 units or below.</Empty>
          )}
        </AdminCard>

        <AdminCard>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="admin-card-title mb-0">Reviews to moderate</h2>
            <Link href="/admin/reviews" className="text-sm font-semibold text-zinc-600 hover:text-black">
              Open →
            </Link>
          </div>
          {data.pendingReviewRows.length ? (
            <ul className="space-y-3 text-sm">
              {data.pendingReviewRows.map((row) => (
                <li key={row.id}>
                  <p className="font-medium">
                    {row.rating}/5 · {row.productName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {row.customerName}
                    {row.title ? ` · ${row.title}` : ""} · {formatLagosDateTime(row.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Review queue is clear.</Empty>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="admin-card-title mb-0">Abandoned carts</h2>
            <Link href="/admin/abandoned-carts" className="text-sm font-semibold text-zinc-600 hover:text-black">
              Open →
            </Link>
          </div>
          {data.abandonedRows.length ? (
            <ul className="space-y-3 text-sm">
              {data.abandonedRows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.email ?? "No email"}</p>
                    <p className="text-xs text-zinc-500">
                      {row.itemCount} items · {formatLagosDateTime(row.updatedAt)}
                      {row.contacted ? " · contacted" : ""}
                    </p>
                  </div>
                  <span className="font-medium">{formatNgn(row.subtotal)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No idle carts past the {data.idleMinutes}-minute threshold.</Empty>
          )}
        </AdminCard>

        <AdminCard>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="admin-card-title mb-0">Inbox</h2>
            <Link href="/admin/messages" className="text-sm font-semibold text-zinc-600 hover:text-black">
              Open →
            </Link>
          </div>
          {data.messageRows.length ? (
            <ul className="space-y-3 text-sm">
              {data.messageRows.map((row) => (
                <li key={row.id}>
                  <p className="font-medium">
                    {row.name} · {row.email}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {row.subject || "No subject"} · {formatLagosDateTime(row.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No contact messages.</Empty>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
