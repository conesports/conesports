import type { OrderStatus, ReviewStatus } from "@prisma/client";

const LAGOS = "Africa/Lagos";

export function formatLagosDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: LAGOS,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatLagosDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: LAGOS,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function lagosDayKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatLagosNow() {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: LAGOS,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function orderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pending payment";
    case "PAID":
      return "Paid";
    case "PACKED":
      return "Packed";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

export function reviewStatusLabel(status: ReviewStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function gatewayLabel(gateway: string | null | undefined) {
  if (!gateway) return "—";
  const value = gateway.toLowerCase();
  if (value.includes("paystack")) return "Paystack";
  if (value.includes("flutter")) return "Flutterwave";
  return gateway;
}
