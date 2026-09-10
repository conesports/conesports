import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AccountPage() {
  const session = await auth();
  const orders = session?.user?.id
    ? await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <SignOutButton />
      </div>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
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
                  <Link href={`/account/orders/${order.id}`}>
                    {order.createdAt.toISOString().slice(0, 10)}
                  </Link>
                </td>
                <td className="border-b py-2">{order.status}</td>
                <td className="border-b py-2">
                  {formatMoney(order.total, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
