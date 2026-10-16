import { getSettingsMap } from "@/lib/settings";

export type SocialNetwork = "facebook" | "instagram" | "tiktok";

export type SocialLink = {
  label: string;
  href: string;
  network: SocialNetwork;
};

export const SITE_CONTACT = {
  company: "CONE SPORTS LTD",
  addressLines: ["Plot 9 Cone close by Hausa Rd, Sabon Gari", "Kano"],
  phoneDisplay: "08033459787",
  phoneHref: "tel:+2348033459787",
};

const SOCIAL_DEFS: Array<{
  key: string;
  label: string;
  network: SocialNetwork;
}> = [
  { key: "social_facebook_url", label: "Facebook", network: "facebook" },
  { key: "social_instagram_url", label: "Instagram", network: "instagram" },
  { key: "social_tiktok_url", label: "TikTok", network: "tiktok" },
];

function normalizeSocialUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^\/+/, "")}`;
}

/** Footer social icons — always FB / IG / TikTok; href empty until set in admin. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const map = await getSettingsMap(SOCIAL_DEFS.map((d) => d.key));
  return SOCIAL_DEFS.map((def) => ({
    label: def.label,
    href: normalizeSocialUrl(map[def.key] ?? ""),
    network: def.network,
  }));
}
