import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin-status-badge";
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
      <p className="admin-label text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </>
  );
  const className = "block bg-white p-5";
  return href ? (
    <Link href={href} className={`${className} transition hover:bg-zinc-50`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight uppercase">{title}</h2>
        {href ? (
          <Link href={href} className="admin-label text-zinc-500 hover:text-black">
            Open →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export function AdminDashboardView({ data }: { data: DashboardSnapshot }) {
  const maxRevenue = Math.max(1, ...data.series.map((day) => day.revenue));
  const statusTotal = data.statusCounts.reduce((sum, row) => sum + row.count, 0) || 1;

  return (
    <div className="-mx-4 -mt-4 md:-mx-8 md:-mt-8">
      <section className="bg-black px-4 py-10 text-white md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="admin-label text-white/50">ConeSports · Lagos</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight uppercase md:text-5xl">
              House overview
            </h1>
            <p className="mt-3 text-sm text-white/65">{formatLagosNow()}</p>
            {!data.available ? (
              <p className="mt-3 text-sm text-amber-200">
                Database is offline. Figures will appear once Postgres is connected.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-outline">
              View store
            </Link>
            <Link href="/admin/products/new" className="btn-solid">
              New product
            </Link>
          </div>
        </div>
      </section>

      {data.alerts.length ? (
        <div className="flex flex-wrap gap-2 bg-[var(--club)] px-4 py-4 md:px-8">
          {data.alerts.map((alert) => (
            <Link
              key={alert.label}
              href={alert.href}
              className="bg-white px-3 py-2 text-[11px] font-bold tracking-[0.12em] text-black uppercase"
            >
              {alert.count} {alert.label}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--club)] px-4 py-3 text-[11px] font-bold tracking-[0.14em] text-white/80 uppercase md:px-8">
          No queues waiting · Standard delivery · Paystack · Ships nationwide
        </div>
      )}

      <div className="space-y-4 px-4 py-6 md:px-8">
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
          <div className="bg-white p-5 xl:col-span-2">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="admin-label text-zinc-500">Paid sales</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight uppercase">Last 14 days</h2>
              </div>
              <p className="text-sm text-zinc-500">{formatNgn(data.revenueToday)} today</p>
            </div>
            <div className="flex h-44 items-end gap-1">
              {data.series.map((day) => (
                <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full bg-black"
                    style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                    title={`${day.label}: ${formatNgn(day.revenue)} · ${day.orders} orders`}
                  />
                  <span className="hidden text-[9px] tracking-wide text-zinc-400 uppercase sm:block">
                    {day.label.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Panel title="Order status">
            {data.statusCounts.length ? (
              <ul className="space-y-3">
                {data.statusCounts.map((row) => (
                  <li key={row.status}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{orderStatusLabel(row.status)}</span>
                      <span className="font-medium">{row.count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100">
                      <div
                        className="h-full bg-black"
                        style={{ width: `${(row.count / statusTotal) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No orders yet.</Empty>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Catalog">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="admin-label text-zinc-500">Products</dt>
                <dd className="mt-1 text-xl font-bold">{data.products}</dd>
              </div>
              <div>
                <dt className="admin-label text-zinc-500">SKUs</dt>
                <dd className="mt-1 text-xl font-bold">{data.variants}</dd>
              </div>
              <div>
                <dt className="admin-label text-zinc-500">Categories</dt>
                <dd className="mt-1 text-xl font-bold">{data.categories}</dd>
              </div>
              <div>
                <dt className="admin-label text-zinc-500">Active discounts</dt>
                <dd className="mt-1 text-xl font-bold">{data.activeDiscounts}</dd>
              </div>
            </dl>
            <p className="mt-5">
              <Link href="/admin/products" className="admin-label text-zinc-600 hover:text-black">
                Manage catalog →
              </Link>
            </p>
          </Panel>

          <Panel title="Payments">
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
              <Link href="/admin/settings" className="admin-label text-zinc-600 hover:text-black">
                Payment settings →
              </Link>
            </p>
          </Panel>

          <Panel title="Quick links">
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
                  <Link href={href} className="block border border-zinc-200 px-3 py-2 hover:border-black">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Recent orders" href="/admin/orders">
          {data.recentOrders.length ? (
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
          ) : (
            <Empty>No orders yet. Paid totals stay in naira (kobo in the database).</Empty>
          )}
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Low stock" href="/admin/products/stock">
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
          </Panel>

          <Panel title="Reviews to moderate" href="/admin/reviews">
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
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Abandoned carts" href="/admin/abandoned-carts">
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
          </Panel>

          <Panel title="Inbox" href="/admin/messages">
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
          </Panel>
        </div>
      </div>
    </div>
  );
}
