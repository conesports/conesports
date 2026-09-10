import type { Metadata } from "next";
import { appUrl, effectivePriceKobo, formatNgn } from "@/lib/money";

export const SITE_NAME = "ConeSports";
export const SITE_DESCRIPTION =
  "ConeSports — Nigerian sportswear. Match kits, trainers, and training gear. Prices in naira. Ships nationwide.";

export function siteOrigin() {
  return appUrl();
}

export function absoluteUrl(path: string) {
  const origin = siteOrigin();
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const description = opts.description?.trim() || SITE_DESCRIPTION;
  const url = opts.path ? absoluteUrl(opts.path) : undefined;
  const image = opts.image ? absoluteUrl(opts.image) : undefined;
  return {
    title: opts.title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: opts.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function productOfferPrice(priceKobo: number, discountPercent: number) {
  return (effectivePriceKobo(priceKobo, discountPercent) / 100).toFixed(2);
}

export function productJsonLd(opts: {
  name: string;
  slug: string;
  description: string;
  images: string[];
  priceKobo: number;
  discountPercent: number;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description || opts.name,
    image: opts.images.map((src) => absoluteUrl(src)),
    url: absoluteUrl(`/product/${opts.slug}`),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: productOfferPrice(opts.priceKobo, opts.discountPercent),
      availability: opts.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${opts.slug}`),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export { formatNgn };
