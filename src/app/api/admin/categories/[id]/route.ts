import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { categoryWriteSchema } from "@/lib/validators";
import { slugify } from "@/lib/money";
import { revalidateCatalog } from "@/lib/revalidate-catalog";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = categoryWriteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
  }

  const slug = slugify(parsed.data.slug) || slugify(parsed.data.name);
  const slugTaken = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      intro: parsed.data.intro,
      sortOrder: parsed.data.sortOrder ?? existing.sortOrder,
    },
  });

  revalidateCatalog({ categorySlugs: [existing.slug, category.slug] });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (category._count.products > 0) {
    return NextResponse.json(
      { error: "Cannot delete a category that has products assigned" },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidateCatalog({ categorySlugs: [category.slug] });
  return NextResponse.json({ id });
}
