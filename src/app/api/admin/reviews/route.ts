import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const items = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      customer: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json({ items });
}

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["APPROVED", "REJECTED", "HIDDEN"]),
});

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = bulkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await prisma.review.updateMany({
    where: { id: { in: parsed.data.ids } },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}
