"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { effectivePriceKobo, formatNgn } from "@/lib/money";

type Variant = { id: string; size: string; color: string; stock: number };

export function ProductDetail({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    price: number;
    discountPercent: number;
    variants: Variant[];
  };
}) {
  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product.variants],
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants],
  );
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");
  const [activeImage, setActiveImage] = useState(0);

  const variant = product.variants.find(
    (v) => v.size === size && v.color === color,
  );
  const charge = effectivePriceKobo(product.price, product.discountPercent);
  const inStock = (variant?.stock ?? 0) > 0;
  const image = product.images[activeImage];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        {image ? (
          <div className="relative mb-3 aspect-square bg-zinc-100">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="mb-3 flex aspect-square items-center justify-center bg-zinc-100 text-sm">
            No image
          </div>
        )}
        {product.images.length > 1 ? (
          <div className="flex gap-2">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                className="relative h-16 w-16 border"
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p>
          {product.discountPercent > 0 ? (
            <>
              {formatNgn(charge)} <s>{formatNgn(product.price)}</s>
            </>
          ) : (
            formatNgn(product.price)
          )}
        </p>
        {product.description ? (
          <p className="text-sm text-zinc-700">{product.description}</p>
        ) : null}
        {sizes.length ? (
          <label className="block text-sm">
            Size
            <select
              className="mt-1 block border px-2 py-1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        ) : null}
        {colors.length ? (
          <label className="block text-sm">
            Color
            <select
              className="mt-1 block border px-2 py-1"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              {colors.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        ) : null}
        <p className="text-sm">{inStock ? "In stock" : "Out of stock"}</p>
        {variant && inStock ? (
          <AddToCartButton
            item={{
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              slug: product.slug,
              image: product.images[0] ?? "",
              price: charge,
              listPrice: product.price,
              discountPercent: product.discountPercent,
              size: variant.size,
              color: variant.color,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
