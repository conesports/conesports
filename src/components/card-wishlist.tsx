"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CardWishlist({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "Saved to wishlist" : "Save to wishlist"}
      className="flex h-8 w-8 items-center justify-center bg-white/90 text-zinc-900 hover:bg-white"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (status !== "authenticated") {
          router.push("/login");
          return;
        }
        void fetch("/api/account/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).then((res) => {
          if (res.ok) setSaved(true);
        });
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden>
        <path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
