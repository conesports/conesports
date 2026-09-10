import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { categoryWriteSchema } from "@/lib/validators";
import { slugify } from "@/lib/money";
import { revalidateCatalog } from "@/lib/revalidate-catalog";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({
    items: rows.map((c) => ({
      ...c,
      productCount: c._count.products,
    })),
  });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      intro: parsed.data.intro,
      sortOrder: parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidateCatalog({ categorySlugs: [category.slug] });
  return NextResponse.json(category, { status: 201 });
}
