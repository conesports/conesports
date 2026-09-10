"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function WishlistButton({ productId }: { productId: string }) {
  const { status } = useSession();
  const [saved, setSaved] = useState(false);

  if (status !== "authenticated") return null;

  return (
    <button
      type="button"
      className="text-sm underline"
      onClick={async () => {
        await fetch("/api/account/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setSaved(true);
      }}
    >
      {saved ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
