import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { emailTypeForStatus } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

function orderRef(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemsHtml(order: OrderWithItems) {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;">${escapeHtml(item.name)} (${escapeHtml(item.size)}${item.color ? ` / ${escapeHtml(item.color)}` : ""}) × ${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${formatMoney(item.price * item.quantity, order.currency)}</td>
        </tr>`,
    )
    .join("");
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;">
    <h1 style="font-size:18px;">${title}</h1>
    ${body}
  </body></html>`;
}

function totalsTable(order: OrderWithItems) {
  return `<table width="100%">${itemsHtml(order)}
    <tr><td>Subtotal</td><td style="text-align:right;">${formatMoney(order.subtotal, order.currency)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right;">${formatMoney(order.shippingCost, order.currency)}</td></tr>
    <tr><td><strong>Total</strong></td><td style="text-align:right;"><strong>${formatMoney(order.total, order.currency)}</strong></td></tr>
  </table>`;
}

function bodyForType(order: OrderWithItems, type: string) {
  const ref = orderRef(order.id);
  const table = totalsTable(order);
  const tracking = order.trackingNumber
    ? ` Tracking ${escapeHtml(order.trackingNumber)}${order.carrier ? ` via ${escapeHtml(order.carrier)}` : ""}.`
    : "";

  switch (type) {
    case "ORDER_PAID":
      return {
        subject: `Payment received — order ${ref}`,
        html: shell(
          "Payment received",
          `<p>We have confirmed payment for order ${ref}. We will pack it next.</p>${table}`,
        ),
      };
    case "ORDER_PACKED":
      return {
        subject: `Packed — order ${ref}`,
        html: shell(
          "Order packed",
          `<p>Order ${ref} has been packed and is waiting to leave our warehouse.</p>${table}`,
        ),
      };
    case "ORDER_SHIPPED":
      return {
        subject: `Shipped — order ${ref}`,
        html: shell(
          "Order shipped",
          `<p>Order ${ref} is on its way.${tracking}</p>${table}`,
        ),
      };
    case "ORDER_DELIVERED":
      return {
        subject: `Delivered — order ${ref}`,
        html: shell(
          "Order delivered",
          `<p>Order ${ref} was marked delivered. Thank you for shopping with ConeSports.</p>${table}`,
        ),
      };
    case "ORDER_CANCELLED":
      return {
        subject: `Cancelled — order ${ref}`,
        html: shell(
          "Order cancelled",
          `<p>Order ${ref} was cancelled and will not be shipped. If you were charged, a refund will follow separately.</p>${table}`,
        ),
      };
    case "ORDER_REFUNDED":
      return {
        subject: `Refunded — order ${ref}`,
        html: shell(
          "Order refunded",
          `<p>A refund for order ${ref} has been issued to the original payment method.</p>${table}`,
        ),
      };
    default:
      return null;
  }
}

export async function sendOrderStatusEmail(orderId: string, status: OrderStatus) {
  const type = emailTypeForStatus(status);
  if (!type) return;

  const existing = await prisma.orderEmailLog.findUnique({
    where: { orderId_type: { orderId, type } },
  });
  if (existing) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order?.email) return;

  const content = bodyForType(order, type);
  if (!content) return;

  const sent = await sendEmail({
    to: order.email,
    subject: content.subject,
    html: content.html,
  });
  if (!sent) return;

  try {
    await prisma.orderEmailLog.create({ data: { orderId, type } });
  } catch {
    // unique constraint = already logged (webhook replay)
  }
}
