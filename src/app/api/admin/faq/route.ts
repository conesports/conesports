import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { getFaqItems, saveFaqItems } from "@/lib/faq";

const putSchema = z.object({
  items: z.array(
    z.object({
      question: z.string().trim().min(1).max(200),
      answer: z.string().trim().min(1).max(4000),
    }),
  ),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ items: await getFaqItems() });
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid FAQ data" }, { status: 400 });
  }
  const items = await saveFaqItems(parsed.data.items);
  revalidatePath("/faq");
  return NextResponse.json({ items });
}
