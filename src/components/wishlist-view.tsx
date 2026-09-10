"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { effectivePriceKobo, formatNgn } from "@/lib/money";

type Item = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPercent: number;
  variantId: string;
  size: string;
  color: string;
};

export function WishlistView({ items }: { items: Item[] }) {
  const router = useRouter();

  async function remove(productId: string) {
    await fetch(`/api/account/wishlist?productId=${productId}`, { method: "DELETE" });
    router.refresh();
  }

  if (!items.length) return <p>No saved products.</p>;

  return (
    <ul className="space-y-3 text-sm">
      {items.map((item) => (
        <li key={item.productId} className="flex items-center justify-between gap-4 border-b py-3">
          <div>
            <Link href={`/product/${item.slug}`}>{item.name}</Link>
            <p>{formatNgn(effectivePriceKobo(item.price, item.discountPercent))}</p>
          </div>
          <div className="flex items-center gap-2">
            {item.variantId ? (
              <AddToCartButton
                item={{
                  productId: item.productId,
                  variantId: item.variantId,
                  name: item.name,
                  slug: item.slug,
                  image: item.image,
                  price: effectivePriceKobo(item.price, item.discountPercent),
                  listPrice: item.price,
                  discountPercent: item.discountPercent,
                  size: item.size,
                  color: item.color,
                }}
              />
            ) : null}
            <button type="button" className="underline" onClick={() => remove(item.productId)}>
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
