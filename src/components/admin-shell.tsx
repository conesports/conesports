"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
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

function crumbLabel(segment: string) {
  if (segment === "admin") return "Admin";
  if (segment === "new") return "New";
  if (segment === "edit") return "Edit";
  if (segment === "stock") return "Inventory";
  if (segment === "abandoned-carts") return "Abandoned carts";
  if (segment === "footer-links") return "Footer links";
  if (segment === "new-and-trending") return "New & trending";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.heading}>
          <p className="admin-label mb-2 px-3 text-white/35">{group.heading}</p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={
                      active
                        ? "block rounded-xl bg-white px-3 py-2.5 text-xs font-bold tracking-[0.12em] text-black uppercase"
                        : "block rounded-xl px-3 py-2.5 text-xs font-bold tracking-[0.12em] text-white/70 uppercase transition hover:bg-white/8 hover:text-white"
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

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const items: { href: string; label: string }[] = [];
    let href = "";
    for (const part of parts) {
      href += `/${part}`;
      if (part === "admin") {
        items.push({ href: "/admin/dashboard", label: "Home" });
        continue;
      }
      items.push({ href, label: crumbLabel(part) });
    }
    return items;
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <aside className="hidden w-[15.5rem] shrink-0 flex-col bg-black text-white lg:flex">
        <div className="px-5 py-6">
          <Link href="/admin/dashboard" className="block">
            <BrandLogo variant="light" layout="mark" className="h-14" priority />
          </Link>
          <p className="admin-label mt-4 text-white/40">Back office</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <AdminNav pathname={pathname} />
        </div>
        <div className="space-y-3 border-t border-white/10 p-4">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2.5 text-xs font-bold tracking-[0.12em] text-white/60 uppercase transition hover:bg-white/8 hover:text-white"
          >
            View storefront
          </Link>
          <button
            type="button"
            className="btn-solid w-full rounded-xl"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/dashboard" className="shrink-0 lg:hidden">
              <BrandLogo variant="dark" className="h-9" />
            </Link>
            <nav className="hidden min-w-0 text-sm text-zinc-500 sm:block" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5">
                {crumbs.map((crumb, index) => (
                  <li key={`${crumb.href}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 ? <span className="text-zinc-300">/</span> : null}
                    {index === crumbs.length - 1 ? (
                      <span className="truncate font-medium text-zinc-800">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="truncate hover:text-black">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-zinc-400 hover:text-black sm:inline-flex"
            >
              Storefront
            </Link>
            <button
              type="button"
              className="admin-label text-zinc-700 lg:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
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
              <div className="flex items-center justify-between px-5 py-5">
                <BrandLogo variant="light" layout="mark" className="h-14" />
                <button
                  type="button"
                  className="admin-label text-white/70"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <AdminNav pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  className="btn-solid w-full rounded-xl"
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
