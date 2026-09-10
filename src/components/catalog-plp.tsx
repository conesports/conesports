import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { PageBanner } from "@/components/page-banner";
import { JsonLd } from "@/components/json-ld";
import { bannerForCatalogPage } from "@/lib/banners";
import type { CatalogPage } from "@/lib/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { breadcrumbJsonLd } from "@/lib/seo";

export function CatalogPlp({
  page,
  searchParams,
}: {
  page: CatalogPage;
  searchParams: Record<string, string | undefined>;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: page.title, path: page.path },
  ];
  const related = relatedLinks(page);

  return (
    <section className="px-0">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav className="mb-6 text-xs text-zinc-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-zinc-900">{page.title}</span>
      </nav>
      <PageBanner
        title={page.title}
        intro={page.intro}
        image={bannerForCatalogPage(page)}
      />
      <div>
        <ProductGrid
          searchParams={searchParams}
          categorySlug={page.kind === "leaf" ? page.slug : undefined}
          categorySlugs={page.kind === "leaf" ? undefined : page.categorySlugs}
          onSale={page.onSale}
          action={page.path}
          fallbackToDemo={page.kind !== "leaf"}
        />
      </div>
      {related.length ? (
        <div className="mt-16 border-t border-zinc-200 pt-10">
          <h2 className="mb-4 text-xs font-bold tracking-[0.14em] uppercase">
            Our categories
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
            {related.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function relatedLinks(page: CatalogPage) {
  if (page.kind === "sport") {
    const sports = NAV_ITEMS.find((n) => n.id === "sports");
    return sports?.columns[0]?.links ?? [];
  }
  const nav = NAV_ITEMS.find((n) => n.id === page.slug || n.href === page.path);
  if (!nav) return [];
  return nav.columns.flatMap((c) => c.links).slice(0, 12);
}
