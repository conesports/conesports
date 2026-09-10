import type { OrderStatus } from "@prisma/client";

export const FULFILLMENT_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function isPaidOrBeyond(status: OrderStatus) {
  return (
    status === "PAID" ||
    status === "PACKED" ||
    status === "SHIPPED" ||
    status === "DELIVERED"
  );
}

export function timestampsForStatus(status: OrderStatus) {
  const now = new Date();
  switch (status) {
    case "PAID":
      return { paidAt: now };
    case "PACKED":
      return { packedAt: now };
    case "SHIPPED":
      return { shippedAt: now };
    case "DELIVERED":
      return { deliveredAt: now };
    default:
      return {};
  }
}

export function emailTypeForStatus(status: OrderStatus) {
  switch (status) {
    case "PAID":
      return "ORDER_PAID";
    case "PACKED":
      return "ORDER_PACKED";
    case "SHIPPED":
      return "ORDER_SHIPPED";
    case "DELIVERED":
      return "ORDER_DELIVERED";
    case "CANCELLED":
      return "ORDER_CANCELLED";
    case "REFUNDED":
      return "ORDER_REFUNDED";
    default:
      return null;
  }
}
