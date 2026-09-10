import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text("ConeSports Invoice");
  doc.moveDown();
  doc.fontSize(11).text(`Order ${order.id.slice(-8).toUpperCase()}`);
  doc.text(`Date ${order.createdAt.toISOString().slice(0, 10)}`);
  doc.text(`Status ${order.status}`);
  doc.text(`Email ${order.email}`);
  doc.moveDown();
  order.items.forEach((item) => {
    doc.text(
      `${item.name} (${item.size}${item.color ? ` / ${item.color}` : ""}) × ${item.quantity}  ${formatMoney(item.price * item.quantity, order.currency)}`,
    );
  });
  doc.moveDown();
  doc.text(`Subtotal ${formatMoney(order.subtotal, order.currency)}`);
  doc.text(`Shipping ${formatMoney(order.shippingCost, order.currency)}`);
  if (order.discountAmount) {
    doc.text(`Discount ${formatMoney(order.discountAmount, order.currency)}`);
  }
  doc.text(`Total ${formatMoney(order.total, order.currency)}`);
  doc.end();

  const pdf = await done;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.id.slice(-8)}.pdf"`,
    },
  });
}
