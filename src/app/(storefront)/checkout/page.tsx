import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const session = await auth();
  const customer = session?.user?.id
    ? await prisma.customer.findUnique({
        where: { userId: session.user.id },
        include: { addresses: { orderBy: { isDefault: "desc" } } },
      })
    : null;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
      <CheckoutForm
        email={session?.user?.email ?? customer?.email}
        name={session?.user?.name ?? customer?.name}
        addresses={customer?.addresses ?? []}
      />
    </section>
  );
}
