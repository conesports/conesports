import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AddressBook } from "@/components/address-book";

export default async function AddressesPage() {
  const session = await auth();
  const customer = session?.user?.id
    ? await prisma.customer.findUnique({
        where: { userId: session.user.id },
        include: { addresses: { orderBy: { isDefault: "desc" } } },
      })
    : null;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Addresses</h1>
      <AddressBook initial={customer?.addresses ?? []} />
    </section>
  );
}
