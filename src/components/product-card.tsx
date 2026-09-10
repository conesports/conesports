import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CardWishlist } from "@/components/card-wishlist";
import { effectivePriceKobo, formatNgn } from "@/lib/money";

export type ProductCardData = {
  id?: string;
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
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const charge = effectivePriceKobo(product.price, product.discountPercent);
  const image = product.images[0];
  const href = product.demo ? "/shop" : `/product/${product.slug}`;
  const collection =
    product.collection || product.categories?.[0]?.name || "ConeSports";
  const colorCount = new Set(
    (product.variants ?? []).map((v) => v.color).filter(Boolean),
  ).size;

  return (
    <article className="group relative">
      <Link href={href} className="block">
        <div className="relative mb-3 aspect-square overflow-hidden bg-[#f5f5f5]">
          {image ? (
            <>
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-3"
                priority={priority}
              />
              <BrandLogo
                variant="dark"
                layout="mark"
                className="pointer-events-none absolute bottom-2 left-2 h-7 opacity-80 md:h-8"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <BrandLogo variant="dark" layout="mark" className="h-16 opacity-30 md:h-20" />
            </div>
          )}
          {product.discountPercent > 0 ? (
            <span className="absolute left-2 top-2 bg-black px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
              -{product.discountPercent}%
            </span>
          ) : product.bestSeller ? (
            <span className="absolute left-2 top-2 bg-black px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
              Best seller
            </span>
          ) : null}
        </div>
        <p className="text-sm font-semibold">{formatNgn(charge)}</p>
        {product.discountPercent > 0 ? (
          <p className="text-xs text-zinc-500 line-through">
            {formatNgn(product.price)}
          </p>
        ) : null}
        <p className="mt-1 text-sm font-medium">{product.name}</p>
        <p className="text-xs text-zinc-500">{collection}</p>
        {colorCount > 1 ? (
          <p className="mt-1 text-xs text-zinc-500">
            {colorCount} colours
          </p>
        ) : null}
      </Link>
      {product.id && !product.demo ? (
        <div className="absolute top-2 right-2">
          <CardWishlist productId={product.id} />
        </div>
      ) : null}
    </article>
  );
}
