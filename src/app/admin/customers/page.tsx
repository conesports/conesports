import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, usersWithoutCustomer, guestEmails] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, isAdmin: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.findMany({
      where: { isAdmin: false, customer: { is: null } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.order.groupBy({
      by: ["email"],
      where: { customerId: null },
      _count: { _all: true },
      _max: { createdAt: true, phone: true },
    }),
  ]);

  const customerEmails = new Set(customers.map((c) => c.email.toLowerCase()));
  const guestOnly = guestEmails.filter((g) => !customerEmails.has(g.email.toLowerCase()));

  const rows: {
    href: string;
    name: string;
    email: string;
    phone: string;
    kind: string;
    orders: number;
    marketing: string;
  }[] = [
    ...customers.map((c) => ({
      href: `/admin/customers/${c.id}`,
      name: c.name ?? "—",
      email: c.email,
      phone: c.phone ?? "—",
      kind: c.userId ? "Registered" : "Guest",
      orders: c._count.orders,
      marketing: c.marketingOptIn ? "Yes" : "No",
    })),
    ...usersWithoutCustomer.map((u) => ({
      href: `/admin/customers/user-${u.id}`,
      name: u.name ?? "—",
      email: u.email ?? "—",
      phone: "—",
      kind: "Registered",
      orders: 0,
      marketing: "—",
    })),
    ...guestOnly.map((g) => ({
      href: `/admin/customers/email-${encodeURIComponent(g.email)}`,
      name: "—",
      email: g.email,
      phone: g._max.phone ?? "—",
      kind: "Guest",
      orders: g._count._all,
      marketing: "—",
    })),
  ];

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Registered accounts and guest checkouts grouped by email."
      />
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Name</th>
            <th className="border-b py-2">Email</th>
            <th className="border-b py-2">Phone</th>
            <th className="border-b py-2">Type</th>
            <th className="border-b py-2">Orders</th>
            <th className="border-b py-2">Marketing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.href}>
              <td className="border-b py-2">
                <Link href={row.href}>{row.name}</Link>
              </td>
              <td className="border-b py-2">{row.email}</td>
              <td className="border-b py-2">{row.phone}</td>
              <td className="border-b py-2">{row.kind}</td>
              <td className="border-b py-2">{row.orders}</td>
              <td className="border-b py-2">{row.marketing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
