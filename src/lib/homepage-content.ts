export type HomepagePromoBar = {
  text: string;
};

export type HomepageHero = {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export type HomepageRail = {
  heading: string;
  enabled: boolean;
};

export type HomepageLookbook = {
  enabled: boolean;
  leftHeading: string;
  leftBody: string;
  leftCta: string;
  leftHref: string;
  rightHeading: string;
  rightBody: string;
  rightCta: string;
  rightHref: string;
};

export type HomepageBrand = {
  heading: string;
  body: string;
};

export type HomepageClub = {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageTile = {
  heading: string;
  body: string;
  cta: string;
  href: string;
};

export type HomepageTileRow = {
  enabled: boolean;
  heading: string;
  tiles: HomepageTile[];
};

export type HomepageCampaign = {
  enabled: boolean;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageQuote = {
  quote: string;
  credit: string;
};

export type HomepageQuotes = {
  enabled: boolean;
  heading: string;
  items: HomepageQuote[];
};

export type HomepageContent = {
  promoBar: HomepagePromoBar;
  hero: HomepageHero;
  shopBy: HomepageTileRow;
  featured: HomepageRail;
  campaign: HomepageCampaign;
  bestSellers: HomepageRail;
  lookbook: HomepageLookbook;
  essentials: HomepageRail;
  split: HomepageLookbook;
  stories: HomepageTileRow;
  quotes: HomepageQuotes;
  brand: HomepageBrand;
  club: HomepageClub;
};

export type HomepageSectionId = keyof HomepageContent;

export const HOMEPAGE_SECTION_IDS = [
  "promoBar",
  "hero",
  "shopBy",
  "featured",
  "campaign",
  "bestSellers",
  "lookbook",
  "essentials",
  "split",
  "stories",
  "quotes",
  "brand",
  "club",
] as const satisfies HomepageSectionId[];

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionId, string> = {
  promoBar: "Promo bar",
  hero: "Hero",
  shopBy: "Shop by sport",
  featured: "Just landed",
  campaign: "Campaign banner",
  bestSellers: "Match-day staples",
  lookbook: "Lookbook tiles",
  essentials: "The week’s kit",
  split: "Kids and sale",
  stories: "From the ground",
  quotes: "From the pitch",
  brand: "Brand statement",
  club: "Cone Club",
};

export const HOMEPAGE_DEFAULTS: HomepageContent = {
  promoBar: {
    text: "Standard delivery · Pay with Paystack · Ships nationwide",
  },
  hero: {
    heading: "Built for the pitch. Ready for the street.",
    body: "Match kits, trainers, and training gear for Nigerian athletes — from 5-a-side in Surulere to long runs on the Third Mainland.",
    ctaLabel: "Shop men",
    ctaHref: "/men",
    ctaSecondaryLabel: "Shop women",
    ctaSecondaryHref: "/women",
  },
  shopBy: {
    enabled: true,
    heading: "Shop by sport",
    tiles: [
      {
        heading: "Football",
        body: "Boots, jerseys, and socks for 5-a-side and Sunday league.",
        cta: "Shop football",
        href: "/sports/football",
      },
      {
        heading: "Running",
        body: "Trainers and layers for the Third Mainland and City Marathon.",
        cta: "Shop running",
        href: "/sports/running",
      },
      {
        heading: "Training",
        body: "Tees, shorts, and bottles that survive a humid session.",
        cta: "Shop training",
        href: "/sports/training",
      },
      {
        heading: "Basketball",
        body: "Court shoes and kit for halls and outdoor runs.",
        cta: "Shop basketball",
        href: "/sports/basketball",
      },
    ],
  },
  featured: {
    heading: "Just landed",
    enabled: true,
  },
  campaign: {
    enabled: true,
    heading: "Back to school",
    body: "September kits, trainers, and bags — ready before first assembly. Priced in naira.",
    ctaLabel: "Shop the drop",
    ctaHref: "/back-to-school",
  },
  bestSellers: {
    heading: "Match-day staples",
    enabled: true,
  },
  lookbook: {
    enabled: true,
    leftHeading: "Men's kit",
    leftBody: "Jerseys, shorts, and trainers cut for Nigerian heat and a full week of sessions.",
    leftCta: "Shop men",
    leftHref: "/men",
    rightHeading: "Women's kit",
    rightBody: "Training layers and match-day pieces that move from the pitch to the street.",
    rightCta: "Shop women",
    rightHref: "/women",
  },
  essentials: {
    heading: "The week’s kit",
    enabled: true,
  },
  split: {
    enabled: true,
    leftHeading: "Kids",
    leftBody: "Youth kits for school, Sunday league, and the first pair of real boots.",
    leftCta: "Shop kids",
    leftHref: "/kids",
    rightHeading: "Sale",
    rightBody: "Marked-down ConeSports kit. Prices in naira while stocks last.",
    rightCta: "Shop sale",
    rightHref: "/sale",
  },
  stories: {
    enabled: true,
    heading: "From the ground",
    tiles: [
      {
        heading: "5-a-side after work",
        body: "Surulere floodlights, dusty pitch, still a full 40 minutes. Kit has to keep up.",
        cta: "Match-day staples",
        href: "/sports/football",
      },
      {
        heading: "Harmattan kilometres",
        body: "The air finally turns cool at 5am. That’s when the hoodie earns its keep.",
        cta: "Shop running",
        href: "/sports/running",
      },
      {
        heading: "Sunday league, always",
        body: "From Ibadan to PH, the weekend game doesn’t wait for imported stock.",
        cta: "Shop new",
        href: "/new-and-trending",
      },
    ],
  },
  quotes: {
    enabled: true,
    heading: "From the pitch",
    items: [
      {
        quote: "If the pitch is dusty, the kit still has to breathe.",
        credit: "Lagos · 5-a-side",
      },
      {
        quote: "Third Mainland at dawn. The jacket is not for show.",
        credit: "Lagos · long run",
      },
      {
        quote: "Sunday league doesn’t wait. Neither should your order.",
        credit: "Abuja · match day",
      },
    ],
  },
  brand: {
    heading: "A Nigerian sports house",
    body: "ConeSports is a Nigerian sports house. We make kit you can actually train in — heat, humidity, and a full week of sessions.",
  },
  club: {
    heading: "Join Cone Club",
    body: "Members get early drops and standard delivery nationwide — paid with Paystack.",
    ctaLabel: "Join Cone Club",
    ctaHref: "/register",
  },
};

const STORAGE_KEY = "site_homepage";

type StoredHomepage = {
  overrides: Partial<HomepageContent>;
  updatedAt?: string;
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out = { ...base } as T;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const val = patch[key];
    if (val === undefined) continue;
    const baseVal = base[key];
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      out[key] = deepMerge(
        baseVal as Record<string, unknown>,
        val as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      out[key] = val as T[keyof T];
    }
  }
  return out;
}

function parseStored(raw: string | null | undefined): StoredHomepage | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const row = parsed as Record<string, unknown>;
    if (row.overrides && typeof row.overrides === "object") {
      return {
        overrides: row.overrides as Partial<HomepageContent>,
        updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
      };
    }
    return { overrides: parsed as Partial<HomepageContent> };
  } catch {
    return null;
  }
}

export function isHomepageSectionId(value: string): value is HomepageSectionId {
  return HOMEPAGE_SECTION_IDS.includes(value as HomepageSectionId);
}

export function mergeHomepageContent(
  overrides: Partial<HomepageContent> | null | undefined,
): HomepageContent {
  if (!overrides) return structuredClone(HOMEPAGE_DEFAULTS);
  return deepMerge(structuredClone(HOMEPAGE_DEFAULTS), overrides);
}

export function sectionHasOverride(
  overrides: Partial<HomepageContent>,
  sectionId: HomepageSectionId,
) {
  return overrides[sectionId] !== undefined;
}

export function overrideFlags(overrides: Partial<HomepageContent>) {
  return Object.fromEntries(
    HOMEPAGE_SECTION_IDS.map((id) => [id, sectionHasOverride(overrides, id)]),
  ) as Record<HomepageSectionId, boolean>;
}

export async function getHomepageOverrides() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.storeSetting.findUnique({
      where: { key: STORAGE_KEY },
      select: { value: true, updatedAt: true },
    });
    const stored = parseStored(row?.value);
    return {
      overrides: stored?.overrides ?? {},
      updatedAt: stored?.updatedAt ?? row?.updatedAt.toISOString(),
    };
  } catch {
    return { overrides: {} as Partial<HomepageContent> };
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const { overrides } = await getHomepageOverrides();
  return mergeHomepageContent(overrides);
}

export async function saveHomepageSection(
  sectionId: HomepageSectionId,
  data: HomepageContent[HomepageSectionId],
) {
  const current = await getHomepageOverrides();
  const payload: StoredHomepage = {
    overrides: { ...current.overrides, [sectionId]: data },
    updatedAt: new Date().toISOString(),
  };
  const { upsertCmsSetting } = await import("@/lib/settings");
  await upsertCmsSetting(STORAGE_KEY, JSON.stringify(payload), "Homepage content");
  return payload;
}

export async function resetHomepageSection(sectionId: HomepageSectionId) {
  const { prisma } = await import("@/lib/prisma");
  const current = await getHomepageOverrides();
  if (!current.overrides[sectionId]) return;
  const overrides = { ...current.overrides };
  delete overrides[sectionId];
  if (Object.keys(overrides).length === 0) {
    await prisma.storeSetting.delete({ where: { key: STORAGE_KEY } }).catch(() => {});
    return;
  }
  const { upsertCmsSetting } = await import("@/lib/settings");
  await upsertCmsSetting(
    STORAGE_KEY,
    JSON.stringify({ overrides, updatedAt: new Date().toISOString() }),
    "Homepage content",
  );
}

export async function resetAllHomepageContent() {
  const { prisma } = await import("@/lib/prisma");
  await prisma.storeSetting.delete({ where: { key: STORAGE_KEY } }).catch(() => {});
}
