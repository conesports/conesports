"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

export function HeaderChrome({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navId = useId();

  useEffect(() => {
    setOpenId(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
        setOpenId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    searchRef.current?.focus();
  }, [searchOpen]);

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenId(null), 180);
  }

  function keepOpen(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenId(id);
  }

  const openItem = NAV_ITEMS.find((item) => item.id === openId) ?? null;

  return (
    <header className="relative border-b border-zinc-200 bg-white">
      <div className="grid h-16 grid-cols-[1fr_auto] items-center gap-3 px-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link href="/" className="shrink-0" aria-label="ConeSports home">
            <BrandLogo variant="dark" layout="header" priority />
          </Link>
        </div>

        <nav
          className="hidden items-center justify-center gap-4 text-zinc-900 lg:flex xl:gap-6"
          aria-label="Primary"
          onMouseLeave={scheduleClose}
        >
          {NAV_ITEMS.map((item) => {
            const hasMenu = item.columns.length > 0;
            const triggerClass = `inline-flex h-16 items-center border-b-2 text-xs font-bold tracking-[0.14em] uppercase ${
              openId === item.id ? "border-black" : "border-transparent"
            } hover:opacity-70`;
            return (
            <div
              key={item.id}
              onMouseEnter={() => {
                if (hasMenu) keepOpen(item.id);
                else setOpenId(null);
              }}
              onFocus={() => {
                if (hasMenu) keepOpen(item.id);
                else setOpenId(null);
              }}
            >
              {item.href && !hasMenu ? (
                <Link href={item.href} className={triggerClass}>
                  {item.label}
                </Link>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={triggerClass}
                  aria-haspopup="true"
                  aria-expanded={openId === item.id}
                  aria-controls={`${navId}-${item.id}`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={triggerClass}
                  aria-haspopup="true"
                  aria-expanded={openId === item.id}
                  aria-controls={`${navId}-${item.id}`}
                  onClick={() =>
                    setOpenId((cur) => (cur === item.id ? null : item.id))
                  }
                >
                  {item.label}
                </button>
              )}
            </div>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <form action="/shop" method="get" className="hidden lg:block">
            <label className="sr-only" htmlFor="header-search">
              Search
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search"
              required
              className="w-40 border-b border-zinc-300 bg-transparent py-1 text-sm outline-none placeholder:text-zinc-400 focus:border-black xl:w-52"
            />
          </form>
          <button
            type="button"
            className="lg:hidden"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
          >
            <SearchIcon />
          </button>
          <Link href={loggedIn ? "/account" : "/login"} aria-label={loggedIn ? "Account" : "Log in"}>
            <UserIcon />
          </Link>
          <Link href="/account/wishlist" aria-label="Wishlist">
            <HeartIcon />
          </Link>
          <CartLink />
        </div>
      </div>

      {openItem && openItem.columns.length > 0 ? (
        <div
          id={`${navId}-${openItem.id}`}
          className="absolute top-full right-0 left-0 z-40 hidden border-t border-zinc-200 bg-white shadow-lg lg:block"
          onMouseEnter={() => keepOpen(openItem.id)}
          onMouseLeave={scheduleClose}
        >
          <MegaPanel item={openItem} />
        </div>
      ) : null}

      {searchOpen ? (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden">
          <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-4">
            <form action="/shop" method="get" className="flex min-w-0 flex-1 items-center gap-3">
              <SearchIcon />
              <label className="sr-only" htmlFor="mobile-search">
                Search
              </label>
              <input
                ref={searchRef}
                id="mobile-search"
                name="q"
                type="search"
                placeholder="Search kits, trainers, and gear"
                required
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-zinc-400"
              />
            </form>
            <button
              type="button"
              className="shrink-0 text-xs font-bold tracking-[0.14em] uppercase"
              onClick={() => setSearchOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
            <p className="text-xs font-bold tracking-[0.14em] uppercase">Menu</p>
            <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <MobileSection
                key={item.id}
                item={item}
                open={mobileSection === item.id}
                onToggle={() =>
                  setMobileSection((cur) => (cur === item.id ? null : item.id))
                }
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
            <div className="mt-6 space-y-3 border-t border-zinc-100 py-4 text-sm">
              <Link href="/about" className="block" onClick={() => setMobileOpen(false)}>
                About Us
              </Link>
              <Link href="/blog" className="block" onClick={() => setMobileOpen(false)}>
                Blog
              </Link>
              <Link href="/faq" className="block" onClick={() => setMobileOpen(false)}>
                Help
              </Link>
              <Link href="/account" className="block" onClick={() => setMobileOpen(false)}>
                Orders & returns
              </Link>
              <Link href="/register" className="block" onClick={() => setMobileOpen(false)}>
                Join Cone Club
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MegaPanel({ item }: { item: NavItem }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-8 py-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {item.columns.map((column) => (
        <div key={column.heading}>
          <p className="mb-3 text-[11px] font-bold tracking-[0.14em] uppercase">
            {column.heading}
          </p>
          <ul className="space-y-2 text-sm font-normal tracking-normal normal-case">
            {column.links.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href} className="text-zinc-700 hover:text-black">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MobileSection({
  item,
  open,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (item.columns.length === 0 && item.href) {
    return (
      <div className="border-b border-zinc-100 py-2">
        <Link
          href={item.href}
          className="block py-3 text-sm font-bold tracking-[0.12em] uppercase"
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-100 py-2">
      <div className="flex items-center justify-between">
        {item.href ? (
          <Link
            href={item.href}
            className="py-3 text-sm font-bold tracking-[0.12em] uppercase"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ) : (
          <span className="py-3 text-sm font-bold tracking-[0.12em] uppercase">
            {item.label}
          </span>
        )}
        <button
          type="button"
          className="px-2 py-3 text-xs tracking-widest uppercase"
          aria-expanded={open}
          onClick={onToggle}
        >
          {open ? "−" : "+"}
        </button>
      </div>
      {open ? (
        <div className="space-y-4 pb-4">
          {item.columns.map((column) => (
            <div key={column.heading}>
              <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-zinc-500 uppercase">
                {column.heading}
              </p>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href} onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19.5c1.4-3.2 4-5 7-5s5.6 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
