import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const customer = session?.user?.id
    ? await prisma.customer.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
      <ProfileForm
        name={session?.user?.name ?? customer?.name ?? ""}
        email={session?.user?.email ?? customer?.email ?? ""}
        phone={customer?.phone ?? ""}
      />
    </section>
  );
}
