import { prisma } from "@/lib/prisma";

export async function upsertCheckoutCustomer(opts: {
  userId?: string | null;
  name: string;
  email: string;
  phone?: string;
}) {
  const email = opts.email.toLowerCase();

  if (opts.userId) {
    const byUser = await prisma.customer.findUnique({
      where: { userId: opts.userId },
    });
    if (byUser) {
      return prisma.customer.update({
        where: { id: byUser.id },
        data: { name: opts.name, email, phone: opts.phone },
      });
    }
    return prisma.customer.create({
      data: {
        userId: opts.userId,
        name: opts.name,
        email,
        phone: opts.phone,
      },
    });
  }

  const byEmail = await prisma.customer.findFirst({
    where: { email, userId: null },
  });
  if (byEmail) {
    return prisma.customer.update({
      where: { id: byEmail.id },
      data: { name: opts.name, phone: opts.phone },
    });
  }

  return prisma.customer.create({
    data: {
      name: opts.name,
      email,
      phone: opts.phone,
    },
  });
}
