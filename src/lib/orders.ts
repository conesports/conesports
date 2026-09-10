import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { verifyFlutterwaveByReference } from "@/lib/flutterwave";
import { isPaidOrBeyond, timestampsForStatus } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import type { OrderStatus } from "@prisma/client";

export async function markOrderPaid(opts: {
  orderId: string;
  paymentReference: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: opts.orderId },
    include: { items: true },
  });
  if (!order) return { ok: false as const, error: "Order not found" };

  if (isPaidOrBeyond(order.status)) {
    return { ok: true as const, alreadyPaid: true };
  }

  if (order.status !== "PENDING") {
    return { ok: false as const, error: "Order cannot be marked paid" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentReference: opts.paymentReference,
        paidAt: new Date(),
        gateway: order.gateway ?? "paystack",
      },
    });

    for (const item of order.items) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (order.discountId) {
      await tx.discount.update({
        where: { id: order.discountId },
        data: { usageCount: { increment: 1 } },
      });
    }
  });

  await sendOrderStatusEmail(order.id, "PAID");
  return { ok: true as const, alreadyPaid: false };
}

export async function confirmPaystackPayment(opts: {
  reference: string;
  expectedOrderId?: string | null;
}) {
  const verified = await verifyPaystackTransaction(opts.reference);
  if (verified.status !== "success") {
    return { ok: false as const, error: "Payment was not completed" };
  }

  const orderId =
    opts.expectedOrderId ||
    verified.metadata?.orderId ||
    (opts.reference.startsWith("cs_") ? opts.reference.slice(3) : null);

  if (!orderId) {
    return { ok: false as const, error: "Order not found for payment reference" };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "Order not found" };

  if (order.total !== verified.amount) {
    return { ok: false as const, error: "Payment amount mismatch" };
  }

  const result = await markOrderPaid({
    orderId,
    paymentReference: verified.reference,
  });
  if (!result.ok) return result;
  return { ok: true as const, orderId, alreadyPaid: result.alreadyPaid };
}

export async function confirmFlutterwavePayment(opts: {
  reference: string;
  expectedOrderId?: string | null;
}) {
  const verified = await verifyFlutterwaveByReference(opts.reference);
  if (verified.status.toLowerCase() !== "successful") {
    return { ok: false as const, error: "Payment was not completed" };
  }

  const orderId =
    opts.expectedOrderId ||
    verified.orderId ||
    (opts.reference.startsWith("cs_") ? opts.reference.slice(3) : null);

  if (!orderId) {
    return { ok: false as const, error: "Order not found for payment reference" };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "Order not found" };

  const expectedMajor = order.total / 100;
  if (Math.abs(expectedMajor - verified.amount) > 0.05) {
    return { ok: false as const, error: "Payment amount mismatch" };
  }

  const result = await markOrderPaid({
    orderId,
    paymentReference: verified.reference,
  });
  if (!result.ok) return result;
  return { ok: true as const, orderId, alreadyPaid: result.alreadyPaid };
}

export async function confirmPaymentForOrder(order: {
  id: string;
  gateway: string | null;
  paymentReference: string;
}) {
  if (order.gateway === "flutterwave") {
    return confirmFlutterwavePayment({
      reference: order.paymentReference,
      expectedOrderId: order.id,
    });
  }
  return confirmPaystackPayment({
    reference: order.paymentReference,
    expectedOrderId: order.id,
  });
}

export async function applyOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra: {
    trackingNumber?: string | null;
    carrier?: string | null;
    adminNotes?: string | null;
  } = {},
) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  const statusChanged = existing?.status !== status;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(statusChanged ? timestampsForStatus(status) : {}),
      ...(extra.trackingNumber !== undefined
        ? { trackingNumber: extra.trackingNumber }
        : {}),
      ...(extra.carrier !== undefined ? { carrier: extra.carrier } : {}),
      ...(extra.adminNotes !== undefined ? { adminNotes: extra.adminNotes } : {}),
    },
  });

  if (statusChanged) {
    await sendOrderStatusEmail(order.id, status);
  }
  return order;
}
