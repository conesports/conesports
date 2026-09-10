import type { Discount } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function applyDiscount(subtotalKobo: number, discount: Discount) {
  if (discount.type === "PERCENT") {
    const pct = Math.min(100, Math.max(0, discount.value));
    return Math.min(subtotalKobo, Math.round((subtotalKobo * pct) / 100));
  }
  return Math.min(subtotalKobo, Math.max(0, discount.value));
}

export async function validateDiscountCode(code: string, subtotalKobo: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false as const, error: "Enter a discount code" };
  }

  const discount = await prisma.discount.findUnique({
    where: { code: normalized },
  });
  if (!discount || !discount.active) {
    return { ok: false as const, error: "Invalid discount code" };
  }
  if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: "This discount code has expired" };
  }
  if (discount.usageLimit != null && discount.usageCount >= discount.usageLimit) {
    return { ok: false as const, error: "This discount code has been fully used" };
  }
  if (subtotalKobo < discount.minOrderValue) {
    return { ok: false as const, error: "Order does not meet the minimum for this code" };
  }

  return {
    ok: true as const,
    discount,
    discountAmount: applyDiscount(subtotalKobo, discount),
  };
}
