"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";

const GROUPS = [
  {
    heading: "House",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/abandoned-carts", label: "Abandoned carts" },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/products/stock", label: "Inventory" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/reviews", label: "Reviews" },
    ],
  },
  {
    heading: "Merchandising",
    items: [
      { href: "/admin/discounts", label: "Discounts" },
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/footer-links", label: "Footer links" },
      { href: "/admin/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Ops",
    items: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/shipping", label: "Shipping" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href || pathname === "/admin";
  }
  if (href === "/admin/products") {
    return (
      pathname === href ||
      (pathname.startsWith("/admin/products/") && !pathname.startsWith("/admin/products/stock"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-7">
      {GROUPS.map((group) => (
        <div key={group.heading}>
          <p className="admin-label mb-2 text-white/40">{group.heading}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={
                      active
                        ? "block bg-white px-3 py-2 text-xs font-bold tracking-[0.12em] text-black uppercase"
                        : "block px-3 py-2 text-xs font-bold tracking-[0.12em] text-white/70 uppercase transition hover:bg-white/10 hover:text-white"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <aside className="hidden w-64 shrink-0 flex-col bg-black text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-6">
          <Link href="/admin/dashboard" className="block">
            <BrandLogo variant="light" layout="mark" className="h-16" priority />
          </Link>
          <p className="admin-label mt-4 text-white/45">Back office</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <AdminNav pathname={pathname} />
        </div>
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="admin-label mb-3 block text-white/55 hover:text-white"
          >
            View storefront →
          </Link>
          <button
            type="button"
            className="btn-solid w-full"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/admin/dashboard">
            <BrandLogo variant="dark" className="h-9" />
          </Link>
          <button
            type="button"
            className="admin-label text-zinc-700"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <aside className="relative flex h-full w-72 flex-col bg-black text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <BrandLogo variant="light" layout="mark" className="h-14" />
                <button
                  type="button"
                  className="admin-label text-white/70"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-6">
                <AdminNav pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  className="btn-solid w-full"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  Log out
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="admin-canvas min-w-0 flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
