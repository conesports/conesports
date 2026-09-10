"use client";

import { SessionProvider } from "next-auth/react";
import { CartHydrator } from "@/components/cart-hydrator";
import { CartSync } from "@/components/cart-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartHydrator />
      <CartSync />
      {children}
    </SessionProvider>
  );
}
