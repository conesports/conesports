import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lagosDayKey } from "@/lib/admin-format";
import { getIdleCartMinutes, idleCartCutoff } from "@/lib/settings";

const PAID: OrderStatus[] = ["PAID", "PACKED", "SHIPPED", "DELIVERED"];
const PIPELINE: OrderStatus[] = ["PAID", "PACKED", "SHIPPED"];
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

export async function loadAdminDashboard(): Promise<DashboardSnapshot> {
  try {
    const idleMinutes = await getIdleCartMinutes();
    const idleCutoff = idleCartCutoff(idleMinutes);
    const today = startOfLagosDay();
    const week = daysAgo(7);
    const month = daysAgo(30);
    const chartStart = daysAgo(13);

    const [
      orderCount,
      paidInProgress,
      pendingPayment,
      delivered,
      cancelled,
      abandonedCarts,
      customerCount,
      productCount,
      variantCount,
      pricePending,
      categoryCount,
      pendingReviews,
      messageCount,
      lowStock,
      activeDiscounts,
      revenueAll,
      revenueToday,
      revenue7d,
      revenue30d,
      ordersToday,
      orders7d,
      orders30d,
      statusGroups,
      gatewayGroups,
      chartOrders,
      recentOrders,
      lowStockRows,
      pendingReviewRows,
      abandonedRows,
      messageRows,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: PIPELINE } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: { in: ["CANCELLED", "REFUNDED"] } } }),
      prisma.abandonedCart.count({
        where: { recoveredAt: null, updatedAt: { lte: idleCutoff } },
      }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.variant.count(),
      prisma.product.count({ where: { priceConfirmed: false } }),
      prisma.category.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.contactMessage.count(),
      prisma.variant.count({ where: { stock: { lte: LOW_STOCK } } }),
      prisma.discount.count({ where: { active: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: PAID } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { status: { in: PAID }, createdAt: { gte: today } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: PAID }, createdAt: { gte: week } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { status: { in: PAID }, createdAt: { gte: month } },
      }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: week } } }),
      prisma.order.count({ where: { createdAt: { gte: month } } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.groupBy({
        by: ["gateway"],
        where: { status: { in: PAID } },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { status: { in: PAID }, createdAt: { gte: chartStart } },
        select: { createdAt: true, total: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
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
        where: { recoveredAt: null, updatedAt: { lte: idleCutoff } },
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
    for (const order of chartOrders) {
      const day = byDay.get(lagosDayKey(order.createdAt));
      if (!day) continue;
      day.orders += 1;
      day.revenue += order.total;
    }

    const rev30 = revenue30d._sum.total ?? 0;
    const paid30 = revenue30d._count;
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
      orders: orderCount,
      paidInProgress,
      pendingPayment,
      delivered,
      cancelled,
      abandonedCarts,
      customers: customerCount,
      products: productCount,
      variants: variantCount,
      pricePending,
      categories: categoryCount,
      pendingReviews,
      messages: messageCount,
      lowStock,
      activeDiscounts,
      revenueToday: revenueToday._sum.total ?? 0,
      revenue7d: revenue7d._sum.total ?? 0,
      revenue30d: rev30,
      revenueAll: revenueAll._sum.total ?? 0,
      ordersToday,
      orders7d,
      orders30d,
      aov30d: paid30 ? Math.round(rev30 / paid30) : 0,
      statusCounts: statusGroups.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      gateways: gatewayGroups.map((row) => ({
        gateway: row.gateway ?? "unset",
        count: row._count._all,
        revenue: row._sum.total ?? 0,
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
