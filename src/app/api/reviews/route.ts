import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3).max(4000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Complete a purchase first" }, { status: 400 });
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: {
        customerId: customer.id,
        status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
      },
    },
  });
  if (!purchased) {
    return NextResponse.json(
      { error: "You can only review products you purchased" },
      { status: 403 },
    );
  }

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      customerId: customer.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
