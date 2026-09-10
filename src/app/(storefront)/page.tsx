import { HomeHero } from "@/components/home-hero";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ProductRailTabs } from "@/components/product-rail-tabs";
import {
  CampaignBanner,
  LookbookPair,
  QuotesRow,
  ShopBySport,
  StoriesRow,
} from "@/components/home-modules";
import { JsonLd } from "@/components/json-ld";
import { DEMO_PRODUCTS } from "@/lib/demo-catalog";
import { getHomepageContent } from "@/lib/homepage-content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  return pageMetadata({
    title: content.hero.heading || "ConeSports",
    description:
      content.hero.body ||
      "Nigerian sportswear — match kits, trainers, and training gear. Prices in naira.",
    path: "/",
  });
}

function toCard(p: {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountPercent: number;
  featured?: boolean;
  bestSeller?: boolean;
  demo?: boolean;
  collection?: string;
  categories?: { name: string }[];
  variants?: { color: string }[];
}): ProductCardData {
  return p;
}

export default async function HomePage() {
  const content = await getHomepageContent();
  let featured: ProductCardData[] = [];
  let bestSellers: ProductCardData[] = [];
  let newest: ProductCardData[] = [];

  try {
    const [featuredRows, bestRows, newRows] = await Promise.all([
      content.featured.enabled
        ? prisma.product.findMany({
            where: { featured: true, priceConfirmed: true },
            take: 8,
            orderBy: { updatedAt: "desc" },
            include: { categories: true, variants: true },
          })
        : Promise.resolve([]),
      content.bestSellers.enabled
        ? prisma.product.findMany({
            where: { bestSeller: true, priceConfirmed: true },
            take: 8,
            orderBy: { updatedAt: "desc" },
            include: { categories: true, variants: true },
          })
        : Promise.resolve([]),
      prisma.product.findMany({
        where: { priceConfirmed: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { categories: true, variants: true },
      }),
    ]);
    featured = featuredRows.map(toCard);
    bestSellers = bestRows.map(toCard);
    newest = newRows.map(toCard);
  } catch {
    featured = [];
    bestSellers = [];
    newest = [];
  }

  const useDemo = featured.length === 0 && bestSellers.length === 0 && newest.length === 0;
  if (useDemo) {
    featured = DEMO_PRODUCTS.filter((p) => p.featured);
    bestSellers = DEMO_PRODUCTS.filter((p) => p.bestSeller);
    newest = DEMO_PRODUCTS;
  }

  const landed = (featured.length ? featured : newest).slice(0, 4);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }])} />

      <HomeHero hero={content.hero} />

      <ShopBySport section={content.shopBy} />

      {content.featured.enabled && landed.length ? (
        <section className="px-4 py-14 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight uppercase md:text-3xl">
            {content.featured.heading}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {landed.map((p, i) => (
              <ProductCard key={p.id ?? p.slug} product={p} priority={i < 2} />
            ))}
          </div>
        </section>
      ) : null}

      <CampaignBanner section={content.campaign} />

      {content.bestSellers.enabled ? (
        <ProductRailTabs
          heading={content.bestSellers.heading}
          tabs={
            useDemo
              ? [
                  {
                    id: "match",
                    label: "Match day",
                    products: DEMO_PRODUCTS.filter((p) => p.rail === "match"),
                  },
                  {
                    id: "training",
                    label: "Training",
                    products: DEMO_PRODUCTS.filter((p) => p.rail === "training"),
                  },
                  {
                    id: "run",
                    label: "Run",
                    products: DEMO_PRODUCTS.filter((p) => p.rail === "run"),
                  },
                ]
              : [
                  { id: "match", label: "Match day", products: bestSellers },
                  { id: "training", label: "Training", products: featured },
                  { id: "run", label: "Run", products: newest },
                ]
          }
        />
      ) : null}

      {content.lookbook.enabled ? <LookbookPair section={content.lookbook} /> : null}

      {content.essentials.enabled ? (
        <section className="px-4 py-14 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight uppercase md:text-3xl">
            {content.essentials.heading}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(newest.length ? newest : DEMO_PRODUCTS).slice(0, 12).map((p) => (
              <ProductCard key={`ess-${p.id ?? p.slug}`} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {content.split.enabled ? (
        <LookbookPair section={content.split} tones={["dark", "club"]} />
      ) : null}

      <StoriesRow section={content.stories} />
      <QuotesRow section={content.quotes} />

      <section className="bg-black px-4 py-16 text-center text-white lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight uppercase md:text-4xl">
          {content.brand.heading}
        </h2>
        {content.brand.body ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/75 md:text-base">
            {content.brand.body}
          </p>
        ) : null}
      </section>
    </>
  );
}
