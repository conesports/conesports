import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getFooterLinks } from "@/lib/site-links";
import { getHomepageContent } from "@/lib/homepage-content";

import { footerProductLinks, footerSportLinks } from "@/lib/navigation";

export async function SiteFooter() {
  const [{ quickLinks, policyLinks }, content] = await Promise.all([
    getFooterLinks(),
    getHomepageContent(),
  ]);

  return (
    <footer className="mt-auto">
      <div className="bg-[var(--club)] px-4 py-10 text-center text-white lg:px-8">
        <p className="text-2xl font-bold tracking-tight md:text-3xl">
          {content.club.heading}
        </p>
        {content.club.body ? (
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
            {content.club.body}
          </p>
        ) : null}
        {content.club.ctaLabel ? (
          <p className="mt-6">
            <Link href={content.club.ctaHref} className="btn-solid">
              {content.club.ctaLabel}
            </Link>
          </p>
        ) : null}
      </div>
      <div className="bg-black px-4 py-12 text-sm text-white lg:px-8">
        <div className="mb-10">
          <Link href="/" aria-label="ConeSports home">
            <BrandLogo variant="light" layout="mark" className="h-14 w-auto md:h-16" />
          </Link>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol title="Products" links={footerProductLinks()} />
          <FooterCol title="Sports" links={footerSportLinks()} />
          <FooterCol title="Support" links={quickLinks} />
          <FooterCol title="Company" links={policyLinks} />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <p>© {new Date().getFullYear()} ConeSports. Lagos, Nigeria.</p>
          <p>Prices in naira. Paystack checkout. Ships nationwide.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-bold tracking-[0.14em] uppercase">{title}</p>
      <ul className="space-y-2 text-white/80">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
