import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { queryShopProducts, shopFacets } from "@/lib/catalog";
import { DEMO_PRODUCTS } from "@/lib/demo-catalog";
import { nairaToKobo } from "@/lib/money";
import Link from "next/link";

function parseFilters(
  sp: Record<string, string | undefined>,
  category?: string,
  categorySlugs?: string[],
  onSale?: boolean,
) {
  return {
    category: category ?? sp.category,
    categories: category ? undefined : categorySlugs,
    q: sp.q,
    minPrice: sp.minPrice ? nairaToKobo(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? nairaToKobo(sp.maxPrice) : undefined,
    size: sp.size,
    color: sp.color,
    inStock: sp.inStock === "1",
    onSale: onSale || sp.onSale === "1",
    sort: sp.sort,
    page: Number(sp.page) || 1,
  };
}

export async function ProductGrid({
  searchParams,
  categorySlug,
  categorySlugs,
  onSale,
  action,
  fallbackToDemo = false,
}: {
  searchParams: Record<string, string | undefined>;
  categorySlug?: string;
  categorySlugs?: string[];
  onSale?: boolean;
  action?: string;
  fallbackToDemo?: boolean;
}) {
  const filters = parseFilters(searchParams, categorySlug, categorySlugs, onSale);
  let items: Awaited<ReturnType<typeof queryShopProducts>>["items"] = [];
  let total = 0;
  let page = 1;
  let pages = 1;
  let facets: Awaited<ReturnType<typeof shopFacets>> = {
    sizes: [],
    colors: [],
    categories: [],
  };

  try {
    const result = await Promise.all([
      queryShopProducts(filters),
      shopFacets(categorySlug),
    ]);
    items = result[0].items;
    total = result[0].total;
    page = result[0].page;
    pages = result[0].pages;
    facets = result[1];
  } catch {
    items = [];
  }

  const formAction = action ?? (categorySlug ? `/shop/${categorySlug}` : "/shop");
  const showDemo = fallbackToDemo && items.length === 0;

  return (
    <>
      <ShopFilters
        action={formAction}
        categories={facets.categories}
        sizes={facets.sizes}
        colors={facets.colors}
        current={searchParams}
      />
      <p className="mb-4 text-sm text-zinc-600">
        {showDemo ? DEMO_PRODUCTS.length : total} products
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {showDemo
          ? DEMO_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {!showDemo && pages > 1 ? (
        <p className="mt-6 text-sm">
          {page > 1 ? (
            <Link href={`${formAction}?page=${page - 1}`}>Previous</Link>
          ) : null}{" "}
          Page {page} of {pages}{" "}
          {page < pages ? (
            <Link href={`${formAction}?page=${page + 1}`}>Next</Link>
          ) : null}
        </p>
      ) : null}
      {!showDemo && items.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No kit matches these filters yet. Check back for the next drop.
        </p>
      ) : null}
    </>
  );
}
