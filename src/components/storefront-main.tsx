"use client";

import { usePathname } from "next/navigation";

export function StorefrontMain({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const home = path === "/";

  return (
    <main
      className={
        home
          ? "w-full flex-1"
          : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"
      }
    >
      {children}
    </main>
  );
}
