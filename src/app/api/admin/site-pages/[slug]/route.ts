import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import {
  DEFAULT_SITE_PAGES,
  deleteSitePage,
  getResolvedSitePage,
  getSitePageDefinition,
  getStoredSitePage,
  saveSitePage,
} from "@/lib/site-pages";

type Ctx = { params: Promise<{ slug: string }> };

const writeSchema = z.object({
  title: z.string().trim().min(1).max(160),
  metaDescription: z.string().trim().max(300).optional(),
  bodyHtml: z.string(),
});

export async function GET(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { slug } = await ctx.params;
  const def = getSitePageDefinition(slug);
  if (!def) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const custom = await getStoredSitePage(slug);
  const resolved = await getResolvedSitePage(slug);
  return NextResponse.json({
    slug,
    label: def.label,
    path: def.path,
    hasOverride: Boolean(custom),
    defaults: DEFAULT_SITE_PAGES[slug],
    page: resolved,
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { slug } = await ctx.params;
  const def = getSitePageDefinition(slug);
  if (!def) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const parsed = writeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page data" }, { status: 400 });
  }
  const page = await saveSitePage({
    slug,
    title: parsed.data.title,
    metaDescription: parsed.data.metaDescription ?? "",
    bodyHtml: parsed.data.bodyHtml,
  });
  revalidatePath(def.path);
  revalidatePath("/", "layout");
  return NextResponse.json({ page, hasOverride: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { slug } = await ctx.params;
  const def = getSitePageDefinition(slug);
  if (!def) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  await deleteSitePage(slug);
  revalidatePath(def.path);
  revalidatePath("/", "layout");
  return NextResponse.json({
    ok: true,
    page: await getResolvedSitePage(slug),
    hasOverride: false,
  });
}
