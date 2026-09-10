import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { formatMoney } from "@/lib/money";
import { CustomerEditor } from "@/components/customer-editor";

export const dynamic = "force-dynamic";

async function resolveCustomer(id: string) {
  if (id.startsWith("user-")) {
    const userId = id.slice(5);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const existing = await prisma.customer.findUnique({ where: { userId } });
    if (existing) return existing;
    return prisma.customer.create({
      data: {
        userId,
        name: user.name,
        email: user.email ?? "",
      },
    });
  }

  if (id.startsWith("email-")) {
    const email = decodeURIComponent(id.slice(6)).toLowerCase();
    const existing = await prisma.customer.findFirst({ where: { email } });
    if (existing) return existing;
    const order = await prisma.order.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
    if (!order) return null;
    return prisma.customer.create({
      data: {
        name: null,
        email,
        phone: order.phone,
      },
    });
  }

  return prisma.customer.findUnique({ where: { id } });
}

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await resolveCustomer(id);
  if (!customer) notFound();

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader title={customer.name || customer.email} />
      <section className="mb-8 max-w-lg space-y-2 text-sm">
        <h2 className="font-medium">Contact</h2>
        <p>{customer.name ?? "—"}</p>
        <p>{customer.email}</p>
        <p>{customer.phone ?? "—"}</p>
        <p>{customer.userId ? "Registered account" : "Guest checkout"}</p>
      </section>
      <CustomerEditor
        id={customer.id}
        notes={customer.notes ?? ""}
        marketingOptIn={customer.marketingOptIn}
      />
      <h2 className="mb-2 mt-8 text-sm font-medium">Orders</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Date</th>
            <th className="border-b py-2">Status</th>
            <th className="border-b py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border-b py-2">
                <Link href={`/admin/orders/${order.id}`}>
                  {order.createdAt.toISOString().slice(0, 10)}
                </Link>
              </td>
              <td className="border-b py-2">{order.status}</td>
              <td className="border-b py-2">{formatMoney(order.total, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
