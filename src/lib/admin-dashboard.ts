import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lagosDayKey } from "@/lib/admin-format";
import { idleCartCutoff } from "@/lib/settings";

const PAID: OrderStatus[] = ["PAID", "PACKED", "SHIPPED", "DELIVERED"];
const LOW_STOCK = 5;

export type DashboardAlert = {
  href: string;
  label: string;
  count: number;
  tone: "warn" | "club" | "muted";
};

export type DashboardDay = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

export type DashboardSnapshot = {
  available: boolean;
  idleMinutes: number;
  orders: number;
  paidInProgress: number;
  pendingPayment: number;
  delivered: number;
  cancelled: number;
  abandonedCarts: number;
  customers: number;
  products: number;
  variants: number;
  pricePending: number;
  categories: number;
  pendingReviews: number;
  messages: number;
  lowStock: number;
  activeDiscounts: number;
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  revenueAll: number;
  ordersToday: number;
  orders7d: number;
  orders30d: number;
  aov30d: number;
  statusCounts: Array<{ status: OrderStatus; count: number }>;
  gateways: Array<{ gateway: string; count: number; revenue: number }>;
  series: DashboardDay[];
  alerts: DashboardAlert[];
  recentOrders: Array<{
    id: string;
    email: string;
    phone: string | null;
    status: OrderStatus;
    total: number;
    gateway: string | null;
    createdAt: string;
    itemCount: number;
    name: string;
  }>;
  lowStockRows: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
    productName: string;
    productId: string;
  }>;
  pendingReviewRows: Array<{
    id: string;
    rating: number;
    title: string | null;
    productName: string;
    customerName: string;
    createdAt: string;
  }>;
  abandonedRows: Array<{
    id: string;
    email: string | null;
    itemCount: number;
    subtotal: number;
    updatedAt: string;
    contacted: boolean;
  }>;
  messageRows: Array<{
    id: string;
    name: string;
    email: string;
    subject: string | null;
    createdAt: string;
  }>;
};

const EMPTY: DashboardSnapshot = {
  available: false,
  idleMinutes: 30,
  orders: 0,
  paidInProgress: 0,
  pendingPayment: 0,
  delivered: 0,
  cancelled: 0,
  abandonedCarts: 0,
  customers: 0,
  products: 0,
  variants: 0,
  pricePending: 0,
  categories: 0,
  pendingReviews: 0,
  messages: 0,
  lowStock: 0,
  activeDiscounts: 0,
  revenueToday: 0,
  revenue7d: 0,
  revenue30d: 0,
  revenueAll: 0,
  ordersToday: 0,
  orders7d: 0,
  orders30d: 0,
  aov30d: 0,
  statusCounts: [],
  gateways: [],
  series: [],
  alerts: [],
  recentOrders: [],
  lowStockRows: [],
  pendingReviewRows: [],
  abandonedRows: [],
  messageRows: [],
};

type KpiRow = {
  idleRaw: string | null;
  orders: number;
  paidInProgress: number;
  pendingPayment: number;
  delivered: number;
  cancelled: number;
  abandonedCarts: number;
  customers: number;
  products: number;
  variants: number;
  pricePending: number;
  categories: number;
  pendingReviews: number;
  messages: number;
  lowStock: number;
  activeDiscounts: number;
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  revenueAll: number;
  ordersToday: number;
  orders7d: number;
  orders30d: number;
  paid30: number;
  statusCounts: Array<{ status: OrderStatus; count: number }> | null;
  gateways: Array<{ gateway: string | null; count: number; revenue: number }> | null;
  chartOrders: Array<{ createdAt: string | Date; total: number }> | null;
};

function startOfLagosDay(now = new Date()) {
  const key = lagosDayKey(now);
  return new Date(`${key}T00:00:00+01:00`);
}

function daysAgo(days: number) {
  const date = startOfLagosDay();
  date.setDate(date.getDate() - days);
  return date;
}

function emptySeries(): DashboardDay[] {
  const days: DashboardDay[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const key = lagosDayKey(date);
    days.push({
      key,
      label: new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "short",
      }).format(date),
      orders: 0,
      revenue: 0,
    });
  }
  return days;
}

function num(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export async function loadAdminDashboard(): Promise<DashboardSnapshot> {
  try {
    const today = startOfLagosDay();
    const week = daysAgo(7);
    const month = daysAgo(30);
    const chartStart = daysAgo(13);
    // Default cutoff; refined after KPI reads the store setting in the same query.
    const fallbackIdle = 30;
    const idleCutoff = idleCartCutoff(fallbackIdle);

    const [kpi] = await prisma.$queryRaw<KpiRow[]>`
      SELECT
        (SELECT value FROM "StoreSetting" WHERE key = 'idle_cart_minutes' LIMIT 1) AS "idleRaw",
        (SELECT COUNT(*)::int FROM "Order") AS orders,
        (SELECT COUNT(*)::int FROM "Order" WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED')) AS "paidInProgress",
        (SELECT COUNT(*)::int FROM "Order" WHERE status::text = 'PENDING') AS "pendingPayment",
        (SELECT COUNT(*)::int FROM "Order" WHERE status::text = 'DELIVERED') AS delivered,
        (SELECT COUNT(*)::int FROM "Order" WHERE status::text IN ('CANCELLED', 'REFUNDED')) AS cancelled,
        (SELECT COUNT(*)::int FROM "AbandonedCart"
          WHERE "recoveredAt" IS NULL AND "updatedAt" <= ${idleCutoff}) AS "abandonedCarts",
        (SELECT COUNT(*)::int FROM "Customer") AS customers,
        (SELECT COUNT(*)::int FROM "Product") AS products,
        (SELECT COUNT(*)::int FROM "Variant") AS variants,
        (SELECT COUNT(*)::int FROM "Product" WHERE "priceConfirmed" = false) AS "pricePending",
        (SELECT COUNT(*)::int FROM "Category") AS categories,
        (SELECT COUNT(*)::int FROM "Review" WHERE status::text = 'PENDING') AS "pendingReviews",
        (SELECT COUNT(*)::int FROM "ContactMessage") AS messages,
        (SELECT COUNT(*)::int FROM "Variant" WHERE stock <= ${LOW_STOCK}) AS "lowStock",
        (SELECT COUNT(*)::int FROM "Discount" WHERE active = true) AS "activeDiscounts",
        (SELECT COALESCE(SUM(total), 0)::bigint FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED') AND "createdAt" >= ${today}) AS "revenueToday",
        (SELECT COALESCE(SUM(total), 0)::bigint FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED') AND "createdAt" >= ${week}) AS "revenue7d",
        (SELECT COALESCE(SUM(total), 0)::bigint FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED') AND "createdAt" >= ${month}) AS "revenue30d",
        (SELECT COALESCE(SUM(total), 0)::bigint FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED')) AS "revenueAll",
        (SELECT COUNT(*)::int FROM "Order" WHERE "createdAt" >= ${today}) AS "ordersToday",
        (SELECT COUNT(*)::int FROM "Order" WHERE "createdAt" >= ${week}) AS "orders7d",
        (SELECT COUNT(*)::int FROM "Order" WHERE "createdAt" >= ${month}) AS "orders30d",
        (SELECT COUNT(*)::int FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED') AND "createdAt" >= ${month}) AS "paid30",
        (SELECT COALESCE(json_agg(json_build_object('status', status, 'count', count)), '[]'::json)
          FROM (SELECT status, COUNT(*)::int AS count FROM "Order" GROUP BY status) s
        ) AS "statusCounts",
        (SELECT COALESCE(json_agg(json_build_object(
            'gateway', gateway,
            'count', count,
            'revenue', revenue
          )), '[]'::json)
          FROM (
            SELECT gateway, COUNT(*)::int AS count, COALESCE(SUM(total), 0)::bigint AS revenue
            FROM "Order"
            WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED')
            GROUP BY gateway
          ) g
        ) AS "gateways",
        (SELECT COALESCE(json_agg(json_build_object('createdAt', "createdAt", 'total', total)), '[]'::json)
          FROM "Order"
          WHERE status::text IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED')
            AND "createdAt" >= ${chartStart}
        ) AS "chartOrders"
    `;

    const parsedIdle = Number(kpi.idleRaw);
    const idleMinutes =
      Number.isFinite(parsedIdle) && parsedIdle > 0 ? Math.round(parsedIdle) : fallbackIdle;
    const listCutoff = idleMinutes === fallbackIdle ? idleCutoff : idleCartCutoff(idleMinutes);

    const [recentOrders, lowStockRows, pendingReviewRows, abandonedRows, messageRows] =
      await Promise.all([
        prisma.order.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            total: true,
            gateway: true,
            createdAt: true,
            customer: { select: { name: true } },
            items: { select: { quantity: true } },
          },
        }),
        prisma.variant.findMany({
          where: { stock: { lte: LOW_STOCK } },
          take: 8,
          orderBy: { stock: "asc" },
          include: { product: { select: { id: true, name: true } } },
        }),
        prisma.review.findMany({
          where: { status: "PENDING" },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { name: true } },
            customer: { select: { name: true, email: true } },
          },
        }),
        prisma.abandonedCart.findMany({
          where: { recoveredAt: null, updatedAt: { lte: listCutoff } },
          take: 5,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.contactMessage.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const series = emptySeries();
    const byDay = new Map(series.map((day) => [day.key, day]));
    for (const order of kpi.chartOrders ?? []) {
      const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      const day = byDay.get(lagosDayKey(createdAt));
      if (!day) continue;
      day.orders += 1;
      day.revenue += num(order.total);
    }

    const revenue30d = num(kpi.revenue30d);
    const paid30 = num(kpi.paid30);
    const pendingPayment = num(kpi.pendingPayment);
    const paidInProgress = num(kpi.paidInProgress);
    const abandonedCarts = num(kpi.abandonedCarts);
    const pricePending = num(kpi.pricePending);
    const pendingReviews = num(kpi.pendingReviews);
    const lowStock = num(kpi.lowStock);
    const messageCount = num(kpi.messages);

    const alerts: DashboardAlert[] = [
      pendingPayment
        ? { href: "/admin/orders?status=PENDING", label: "Awaiting payment", count: pendingPayment, tone: "warn" }
        : null,
      paidInProgress
        ? { href: "/admin/orders", label: "In fulfillment", count: paidInProgress, tone: "club" }
        : null,
      abandonedCarts
        ? { href: "/admin/abandoned-carts", label: "Idle carts", count: abandonedCarts, tone: "warn" }
        : null,
      pricePending
        ? { href: "/admin/products?unconfirmed=1", label: "Price unconfirmed", count: pricePending, tone: "warn" }
        : null,
      pendingReviews
        ? { href: "/admin/reviews", label: "Reviews to moderate", count: pendingReviews, tone: "club" }
        : null,
      lowStock
        ? { href: "/admin/products/stock", label: "Low-stock SKUs", count: lowStock, tone: "warn" }
        : null,
      messageCount
        ? { href: "/admin/messages", label: "Inbox messages", count: messageCount, tone: "muted" }
        : null,
    ].filter((row): row is DashboardAlert => Boolean(row));

    return {
      available: true,
      idleMinutes,
      orders: num(kpi.orders),
      paidInProgress,
      pendingPayment,
      delivered: num(kpi.delivered),
      cancelled: num(kpi.cancelled),
      abandonedCarts,
      customers: num(kpi.customers),
      products: num(kpi.products),
      variants: num(kpi.variants),
      pricePending,
      categories: num(kpi.categories),
      pendingReviews,
      messages: messageCount,
      lowStock,
      activeDiscounts: num(kpi.activeDiscounts),
      revenueToday: num(kpi.revenueToday),
      revenue7d: num(kpi.revenue7d),
      revenue30d,
      revenueAll: num(kpi.revenueAll),
      ordersToday: num(kpi.ordersToday),
      orders7d: num(kpi.orders7d),
      orders30d: num(kpi.orders30d),
      aov30d: paid30 ? Math.round(revenue30d / paid30) : 0,
      statusCounts: (kpi.statusCounts ?? []).map((row) => ({
        status: row.status,
        count: num(row.count),
      })),
      gateways: (kpi.gateways ?? []).map((row) => ({
        gateway: row.gateway ?? "unset",
        count: num(row.count),
        revenue: num(row.revenue),
      })),
      series,
      alerts,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        email: order.email,
        phone: order.phone,
        status: order.status,
        total: order.total,
        gateway: order.gateway,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        name: order.customer?.name ?? "Guest",
      })),
      lowStockRows: lowStockRows.map((row) => ({
        id: row.id,
        sku: row.sku,
        size: row.size,
        color: row.color,
        stock: row.stock,
        productName: row.product.name,
        productId: row.product.id,
      })),
      pendingReviewRows: pendingReviewRows.map((row) => ({
        id: row.id,
        rating: row.rating,
        title: row.title,
        productName: row.product.name,
        customerName: row.customer.name || row.customer.email,
        createdAt: row.createdAt.toISOString(),
      })),
      abandonedRows: abandonedRows.map((row) => ({
        id: row.id,
        email: row.email,
        itemCount: row.itemCount,
        subtotal: row.subtotal,
        updatedAt: row.updatedAt.toISOString(),
        contacted: Boolean(row.contactedAt),
      })),
      messageRows: messageRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch {
    return EMPTY;
  }
}
