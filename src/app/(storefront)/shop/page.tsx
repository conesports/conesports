import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { PageBanner } from "@/components/page-banner";
import { BANNER } from "@/lib/banners";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description: "Browse the ConeSports catalog.",
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  return (
    <section>
      <PageBanner
        title="Shop"
        intro="Browse the ConeSports catalog. Prices in naira. Ships nationwide."
        image={BANNER.shop}
      />
      <ProductGrid searchParams={flat} />
    </section>
  );
}
