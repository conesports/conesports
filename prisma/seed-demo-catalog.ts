/**
 * Upserts DEMO_PRODUCTS into the database so admin + storefront share one catalog.
 * Usage: npx tsx --env-file=.env.local prisma/seed-demo-catalog.ts
 */
import { PrismaClient } from "@prisma/client";
import { DEMO_PRODUCTS } from "../src/lib/demo-catalog";
import { slugify, variantSku } from "../src/lib/money";

const prisma = new PrismaClient();

const APPAREL_SIZES = ["S", "M", "L", "XL"];
const ONE_SIZE = ["One size"];

function sizesForSlug(slug: string) {
  const oneSize = new Set([
    "match-day-flask",
    "five-a-side-sock-pack",
    "cone-club-cap",
    "sunday-league-match-ball",
    "island-recovery-slide",
    "wuse-gym-duffel",
  ]);
  return oneSize.has(slug) ? ONE_SIZE : APPAREL_SIZES;
}

async function main() {
  const collections = [...new Set(DEMO_PRODUCTS.map((p) => p.collection))];
  const categoryByName = new Map<string, string>();

  for (const [index, name] of collections.entries()) {
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { slug },
      create: { name, slug, intro: `${name} kit from ConeSports.`, sortOrder: index },
      update: { name, sortOrder: index },
    });
    categoryByName.set(name, category.id);
  }

  let upserted = 0;
  for (const demo of DEMO_PRODUCTS) {
    const categoryId = categoryByName.get(demo.collection);
    const sizes = sizesForSlug(demo.slug);
    const variants = demo.variants.flatMap((v) =>
      sizes.map((size) => ({
        size,
        color: v.color,
        stock: 12,
        sku: variantSku(demo.slug, size, v.color),
      })),
    );

    const product = await prisma.product.upsert({
      where: { slug: demo.slug },
      create: {
        name: demo.name,
        slug: demo.slug,
        description: demo.description,
        price: demo.price,
        discountPercent: demo.discountPercent,
        images: demo.images,
        featured: demo.featured,
        bestSeller: demo.bestSeller,
        priceConfirmed: true,
        categories: categoryId ? { connect: [{ id: categoryId }] } : undefined,
        variants: { create: variants },
      },
      update: {
        name: demo.name,
        description: demo.description,
        price: demo.price,
        discountPercent: demo.discountPercent,
        images: demo.images,
        featured: demo.featured,
        bestSeller: demo.bestSeller,
        priceConfirmed: true,
        categories: categoryId
          ? { set: [{ id: categoryId }] }
          : { set: [] },
      },
    });

    // Refresh variants so edits stay predictable after re-seed.
    await prisma.variant.deleteMany({ where: { productId: product.id } });
    await prisma.variant.createMany({
      data: variants.map((v) => ({ ...v, productId: product.id })),
    });

    upserted += 1;
    console.log(`✓ ${demo.name} (${variants.length} variants)`);
  }

  console.log(`\nSeeded ${upserted} demo products and ${collections.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
