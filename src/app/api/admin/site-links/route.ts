import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { getFooterLinks, saveFooterLinks } from "@/lib/site-links";

const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().min(1).max(200),
});

const putSchema = z.object({
  quickLinks: z.array(linkSchema).min(1),
  policyLinks: z.array(linkSchema).min(1),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json(await getFooterLinks());
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Each group needs at least one link with a label and URL" },
      { status: 400 },
    );
  }
  try {
    const links = await saveFooterLinks(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/account", "layout");
    return NextResponse.json(links);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to save links" },
      { status: 400 },
    );
  }
}
