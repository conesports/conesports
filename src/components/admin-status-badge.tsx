import type { OrderStatus } from "@prisma/client";
import { orderStatusLabel } from "@/lib/admin-format";

const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-900",
  PAID: "bg-emerald-50 text-emerald-900",
  PACKED: "bg-[var(--club)]/10 text-[var(--club)]",
  SHIPPED: "bg-sky-50 text-sky-900",
  DELIVERED: "bg-zinc-100 text-zinc-800",
  CANCELLED: "bg-red-50 text-red-800",
  REFUNDED: "bg-zinc-100 text-zinc-600",
};

export function AdminStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${TONE[status]}`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
