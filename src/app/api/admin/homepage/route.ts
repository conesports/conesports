import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import {
  HOMEPAGE_DEFAULTS,
  HOMEPAGE_SECTION_IDS,
  getHomepageContent,
  getHomepageOverrides,
  isHomepageSectionId,
  mergeHomepageContent,
  overrideFlags,
  resetAllHomepageContent,
  resetHomepageSection,
  saveHomepageSection,
  sectionHasOverride,
  type HomepageContent,
  type HomepageSectionId,
} from "@/lib/homepage-content";

const promoBarSchema = z.object({
  text: z.string(),
});
const heroSchema = z.object({
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  ctaSecondaryLabel: z.string(),
  ctaSecondaryHref: z.string(),
});
const railSchema = z.object({
  heading: z.string(),
  enabled: z.boolean(),
});
const lookbookSchema = z.object({
  enabled: z.boolean(),
  leftHeading: z.string(),
  leftBody: z.string(),
  leftCta: z.string(),
  leftHref: z.string(),
  rightHeading: z.string(),
  rightBody: z.string(),
  rightCta: z.string(),
  rightHref: z.string(),
});
const brandSchema = z.object({
  heading: z.string(),
  body: z.string(),
});
const clubSchema = z.object({
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

const tileSchema = z.object({
  heading: z.string(),
  body: z.string(),
  cta: z.string(),
  href: z.string(),
});
const tileRowSchema = z.object({
  enabled: z.boolean(),
  heading: z.string(),
  tiles: z.array(tileSchema),
});
const campaignSchema = z.object({
  enabled: z.boolean(),
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});
const quotesSchema = z.object({
  enabled: z.boolean(),
  heading: z.string(),
  items: z.array(
    z.object({
      quote: z.string(),
      credit: z.string(),
    }),
  ),
});

const sectionSchemas: Record<HomepageSectionId, z.ZodType<HomepageContent[HomepageSectionId]>> = {
  promoBar: promoBarSchema,
  hero: heroSchema,
  shopBy: tileRowSchema,
  featured: railSchema,
  campaign: campaignSchema,
  bestSellers: railSchema,
  lookbook: lookbookSchema,
  essentials: railSchema,
  split: lookbookSchema,
  stories: tileRowSchema,
  quotes: quotesSchema,
  brand: brandSchema,
  club: clubSchema,
};

const putSchema = z.object({
  sectionId: z.enum(HOMEPAGE_SECTION_IDS),
  data: z.unknown(),
});

async function payload() {
  const [content, { overrides, updatedAt }] = await Promise.all([
    getHomepageContent(),
    getHomepageOverrides(),
  ]);
  return {
    content,
    defaults: HOMEPAGE_DEFAULTS,
    overridden: overrideFlags(overrides),
    overriddenSections: HOMEPAGE_SECTION_IDS.filter((id) =>
      sectionHasOverride(overrides, id),
    ),
    updatedAt,
  };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json(await payload());
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid section payload" }, { status: 400 });
  }
  const data = sectionSchemas[parsed.data.sectionId].safeParse(parsed.data.data);
  if (!data.success) {
    return NextResponse.json({ error: "Invalid section data" }, { status: 400 });
  }
  await saveHomepageSection(parsed.data.sectionId, data.data);
  revalidatePath("/");
  return NextResponse.json(await payload());
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const section = new URL(req.url).searchParams.get("section");
  if (section) {
    if (!isHomepageSectionId(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    await resetHomepageSection(section);
  } else {
    await resetAllHomepageContent();
  }
  revalidatePath("/");
  const { overrides } = await getHomepageOverrides();
  return NextResponse.json({
    content: mergeHomepageContent(overrides),
    defaults: HOMEPAGE_DEFAULTS,
    overridden: overrideFlags(overrides),
    overriddenSections: HOMEPAGE_SECTION_IDS.filter((id) =>
      sectionHasOverride(overrides, id),
    ),
  });
}
