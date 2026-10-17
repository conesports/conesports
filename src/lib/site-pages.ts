import { prisma } from "@/lib/prisma";
import { upsertCmsSetting } from "@/lib/settings";
import { sanitizeSitePageHtml } from "@/lib/site-page-html";

export type SitePageDefinition = {
  slug: string;
  path: string;
  label: string;
};

export const SITE_PAGES: SitePageDefinition[] = [
  { slug: "privacy-policy", path: "/privacy-policy", label: "Privacy Policy" },
  { slug: "refund-policy", path: "/refund-policy", label: "Refund Policy" },
  { slug: "shipping-returns", path: "/shipping-returns", label: "Shipping & Returns" },
  { slug: "terms-of-service", path: "/terms-of-service", label: "Terms of Service" },
  { slug: "about", path: "/about", label: "About Us" },
];

export type SitePageContent = {
  slug: string;
  title: string;
  metaDescription: string;
  bodyHtml: string;
  updatedAt?: string;
};

const PAGE_KEY_PREFIX = "site_page_";

export function pageSettingKey(slug: string) {
  return `${PAGE_KEY_PREFIX}${slug}`;
}

export function getSitePageDefinition(slug: string) {
  return SITE_PAGES.find((p) => p.slug === slug);
}

export const DEFAULT_SITE_PAGES: Record<string, Omit<SitePageContent, "slug" | "updatedAt">> = {
  "privacy-policy": {
    title: "Privacy Policy",
    metaDescription: "How ConeSports collects and uses personal information.",
    bodyHtml:
      "<h2>Information we collect</h2><p>We collect the name, email, phone, and address you provide at checkout or in your account, plus order history needed to fulfil purchases.</p><h2>How we use it</h2><p>We use this information to process orders, provide support, and send order updates. We do not sell your personal information.</p>",
  },
  "refund-policy": {
    title: "Refund Policy",
    metaDescription: "ConeSports returns and refunds.",
    bodyHtml:
      "<h2>Returns</h2><p>Unused items in original condition may be returned within 14 days of delivery. Contact us with your order number to start a return.</p><h2>Refunds</h2><p>Approved refunds are issued to the original payment method after we receive and inspect the goods.</p>",
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    metaDescription: "ConeSports shipping options and returns.",
    bodyHtml:
      "<h2>Shipping</h2><p>Domestic and international rates are calculated at checkout from the destination and item count. Free shipping applies when the order meets the published threshold.</p><h2>Returns</h2><p>See the Refund Policy for eligibility and timelines.</p>",
  },
  "terms-of-service": {
    title: "Terms of Service",
    metaDescription: "Terms for using the ConeSports store.",
    bodyHtml:
      "<h2>Using this store</h2><p>By placing an order you confirm the information you provide is accurate and that you are authorised to use the selected payment method.</p><h2>Availability</h2><p>Prices and stock are confirmed at checkout. We may cancel an order if an item cannot be fulfilled and will notify you.</p>",
  },
  about: {
    title: "About Us",
    metaDescription: "Learn more about ConeSports.",
    bodyHtml:
      "<h2>Our story</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><h2>What we stand for</h2><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Nullam id dolor id nibh ultricies vehicula ut id elit.</p><ul><li>Lorem ipsum dolor sit amet</li><li>Consectetur adipiscing elit</li><li>Sed do eiusmod tempor incididunt</li></ul><h2>Looking ahead</h2><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>",
  },
};

function parseStored(raw: string | null | undefined): SitePageContent | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const row = parsed as Record<string, unknown>;
    const slug = typeof row.slug === "string" ? row.slug : "";
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const metaDescription =
      typeof row.metaDescription === "string" ? row.metaDescription.trim() : "";
    const bodyHtml = typeof row.bodyHtml === "string" ? row.bodyHtml : "";
    if (!slug || !title) return null;
    return {
      slug,
      title,
      metaDescription,
      bodyHtml,
      updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function getDefaultSitePage(slug: string): SitePageContent | null {
  const def = getSitePageDefinition(slug);
  const fallback = DEFAULT_SITE_PAGES[slug];
  if (!def || !fallback) return null;
  return { slug, ...fallback };
}

export async function getStoredSitePage(slug: string): Promise<SitePageContent | null> {
  try {
    const row = await prisma.storeSetting.findUnique({
      where: { key: pageSettingKey(slug) },
      select: { value: true, updatedAt: true },
    });
    const parsed = parseStored(row?.value);
    if (!parsed) return null;
    return {
      ...parsed,
      updatedAt: parsed.updatedAt ?? row?.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getResolvedSitePage(slug: string): Promise<SitePageContent | null> {
  const stored = await getStoredSitePage(slug);
  if (stored) return stored;
  return getDefaultSitePage(slug);
}

export async function saveSitePage(input: {
  slug: string;
  title: string;
  metaDescription: string;
  bodyHtml: string;
}) {
  const def = getSitePageDefinition(input.slug);
  if (!def) throw new Error("Unknown page");
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const payload: SitePageContent = {
    slug: input.slug,
    title,
    metaDescription: input.metaDescription.trim(),
    bodyHtml: sanitizeSitePageHtml(input.bodyHtml),
    updatedAt: new Date().toISOString(),
  };
  await upsertCmsSetting(pageSettingKey(input.slug), JSON.stringify(payload), `Page: ${def.label}`);
  return payload;
}

export async function deleteSitePage(slug: string) {
  await prisma.storeSetting.delete({ where: { key: pageSettingKey(slug) } }).catch(() => {});
}

export async function listSitePagesForAdmin() {
  const keys = SITE_PAGES.map((p) => pageSettingKey(p.slug));
  let rows: { key: string; updatedAt: Date }[] = [];
  try {
    rows = await prisma.storeSetting.findMany({
      where: { key: { in: keys } },
      select: { key: true, updatedAt: true },
    });
  } catch {
    rows = [];
  }
  const bySlug = new Map(rows.map((r) => [r.key.replace(PAGE_KEY_PREFIX, ""), r.updatedAt]));
  return SITE_PAGES.map((def) => ({
    ...def,
    hasOverride: bySlug.has(def.slug),
    updatedAt: bySlug.get(def.slug)?.toISOString(),
  }));
}
