"use client";

import Link from "next/link";
import { cartCount, useCartStore } from "@/lib/store/cart";

export function CartLink() {
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);

  return (
    <Link href="/cart" className="relative inline-flex" aria-label="Bag" suppressHydrationWarning>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 8h12l-1 12H7L6 8Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M9 8V7a3 3 0 0 1 6 0v1"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-black px-1 text-center text-[10px] font-bold leading-4 text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
