import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SocialIconLinks } from "@/components/social-icons";
import { getFooterLinks } from "@/lib/site-links";
import { getHomepageContent } from "@/lib/homepage-content";
import { SITE_CONTACT, getSocialLinks } from "@/lib/site-contact";
import { footerProductLinks, footerSportLinks } from "@/lib/navigation";

export async function SiteFooter() {
  const [{ quickLinks, policyLinks }, content, socials] = await Promise.all([
    getFooterLinks(),
    getHomepageContent(),
    getSocialLinks(),
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
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Link href="/" aria-label="ConeSports home">
            <BrandLogo variant="light" layout="mark" className="h-14 w-auto md:h-16" />
          </Link>
          <SocialIconLinks links={socials} />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="mb-4 text-xs font-bold tracking-[0.14em] uppercase">
              Contact
            </p>
            <div className="space-y-3 text-white/80">
              <p className="font-semibold text-white">{SITE_CONTACT.company}</p>
              <address className="not-italic leading-relaxed">
                {SITE_CONTACT.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p>
                <a
                  href={SITE_CONTACT.phoneHref}
                  className="hover:text-white"
                >
                  {SITE_CONTACT.phoneDisplay}
                </a>
              </p>
            </div>
          </div>
          <FooterCol title="Products" links={footerProductLinks()} />
          <FooterCol title="Sports" links={footerSportLinks()} />
          <FooterCol title="Support" links={quickLinks} />
          <FooterCol title="Company" links={policyLinks} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {SITE_CONTACT.company}. Kano, Nigeria.
          </p>
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
