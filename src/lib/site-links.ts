import { prisma } from "@/lib/prisma";
import { upsertCmsSetting } from "@/lib/settings";

export type SiteLink = {
  label: string;
  href: string;
};

export type FooterLinks = {
  quickLinks: SiteLink[];
  policyLinks: SiteLink[];
};

const QUICK_LINKS_KEY = "footer_quick_links";
const POLICY_LINKS_KEY = "footer_policy_links";

export const DEFAULT_QUICK_LINKS: SiteLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Account", href: "/account" },
];

export const DEFAULT_POLICY_LINKS: SiteLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

function parseLinks(raw: string | null | undefined, fallback: SiteLink[]): SiteLink[] {
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    const links = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const label = typeof row.label === "string" ? row.label.trim() : "";
        const href = typeof row.href === "string" ? row.href.trim() : "";
        if (!label || !href) return null;
        return { label, href };
      })
      .filter((item): item is SiteLink => item !== null);
    return links.length ? links : fallback;
  } catch {
    return fallback;
  }
}

export async function getFooterLinks(): Promise<FooterLinks> {
  try {
    const rows = await prisma.storeSetting.findMany({
      where: { key: { in: [QUICK_LINKS_KEY, POLICY_LINKS_KEY] } },
      select: { key: true, value: true },
    });
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    return {
      quickLinks: parseLinks(byKey.get(QUICK_LINKS_KEY), DEFAULT_QUICK_LINKS),
      policyLinks: parseLinks(byKey.get(POLICY_LINKS_KEY), DEFAULT_POLICY_LINKS),
    };
  } catch {
    return {
      quickLinks: DEFAULT_QUICK_LINKS,
      policyLinks: DEFAULT_POLICY_LINKS,
    };
  }
}

export async function saveFooterLinks(links: FooterLinks) {
  const sanitize = (items: SiteLink[]) =>
    items
      .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
      .filter((item) => item.label && item.href);

  const quickLinks = sanitize(links.quickLinks);
  const policyLinks = sanitize(links.policyLinks);
  if (!quickLinks.length || !policyLinks.length) {
    throw new Error("Each link group needs at least one item with a label and URL.");
  }

  await Promise.all([
    upsertCmsSetting(QUICK_LINKS_KEY, JSON.stringify(quickLinks), "Footer quick links"),
    upsertCmsSetting(POLICY_LINKS_KEY, JSON.stringify(policyLinks), "Footer policy links"),
  ]);

  return { quickLinks, policyLinks };
}
