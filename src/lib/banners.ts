/** Lifestyle banners for merchandising modules. The hero photo is never listed here. */

export const BANNER = {
  football: "/images/banners/football.jpg",
  running: "/images/banners/running.jpg",
  training: "/images/banners/training.jpg",
  basketball: "/images/banners/basketball.jpg",
  golf: "/images/banners/golf.jpg",
  other: "/images/banners/other.jpg",
  school: "/images/banners/school.jpg",
  men: "/images/banners/men.jpg",
  women: "/images/banners/women.jpg",
  kids: "/images/banners/kids.jpg",
  sale: "/images/banners/sale.jpg",
  next: "/images/banners/new.jpg",
  shop: "/images/banners/shop.jpg",
  shoes: "/images/banners/running.jpg",
  clothing: "/images/banners/clothing.jpg",
  accessories: "/images/banners/accessories.jpg",
  fiveAside: "/images/banners/five-aside.jpg",
  harmattan: "/images/banners/harmattan.jpg",
  sunday: "/images/banners/sunday.jpg",
} as const;

const STORY_FALLBACKS = [BANNER.fiveAside, BANNER.harmattan, BANNER.sunday] as const;

export function bannerForHref(href: string): string {
  const path = href.toLowerCase();
  if (path.includes("/sports/football") || path.includes("football")) return BANNER.football;
  if (path.includes("/sports/running") || path.includes("running")) return BANNER.running;
  if (path.includes("/sports/training") || path.includes("training")) return BANNER.training;
  if (path.includes("/sports/basketball") || path.includes("basketball")) return BANNER.basketball;
  if (path.includes("/sports/golf") || path.includes("golf")) return BANNER.golf;
  if (path.includes("/sports/other")) return BANNER.other;
  if (path.includes("back-to-school")) return BANNER.school;
  if (path.includes("/sale") || path.endsWith("sale")) return BANNER.sale;
  if (path.includes("new-and-trending") || path.includes("-new")) return BANNER.next;
  if (path.includes("/kids") || path.includes("kids-")) return BANNER.kids;
  if (path.includes("/women") || path.includes("women-")) return BANNER.women;
  if (path.includes("/men") || path.includes("men-")) return BANNER.men;
  if (path.includes("/shop")) return BANNER.shop;
  return BANNER.shop;
}

export function bannerForStory(heading: string, index: number): string {
  const h = heading.toLowerCase();
  if (h.includes("5-a-side") || h.includes("five-a-side")) return BANNER.fiveAside;
  if (h.includes("harmattan")) return BANNER.harmattan;
  if (h.includes("sunday")) return BANNER.sunday;
  return STORY_FALLBACKS[index % STORY_FALLBACKS.length];
}

export function bannerForCatalogPage(page: {
  slug: string;
  path: string;
  kind: "hub" | "sport" | "leaf";
  onSale?: boolean;
}): string {
  if (page.onSale) return BANNER.sale;
  const key = `${page.path} ${page.slug}`.toLowerCase();

  if (page.slug === "men") return BANNER.men;
  if (page.slug === "women") return BANNER.women;
  if (page.slug === "kids") return BANNER.kids;
  if (page.slug === "back-to-school") return BANNER.school;
  if (page.slug === "sale") return BANNER.sale;
  if (page.slug === "new-and-trending") return BANNER.next;
  if (page.slug === "shop") return BANNER.shop;

  if (page.kind === "sport") {
    if (page.slug === "football") return BANNER.football;
    if (page.slug === "running") return BANNER.running;
    if (page.slug === "training") return BANNER.training;
    if (page.slug === "basketball") return BANNER.basketball;
    if (page.slug === "golf") return BANNER.golf;
    return BANNER.other;
  }

  if (/football|jersey|match-day/.test(key)) return BANNER.football;
  if (/running/.test(key)) return BANNER.running;
  if (/basketball/.test(key)) return BANNER.basketball;
  if (/golf/.test(key)) return BANNER.golf;
  if (/training/.test(key)) return BANNER.training;
  if (/shoe|trainer|slide|boot/.test(key)) return BANNER.shoes;
  if (/bag|cap|sock|bottle|accessor/.test(key)) return BANNER.accessories;
  if (/clothing|short|hoodie|tracksuit|legging|bra|tee/.test(key)) return BANNER.clothing;
  if (/youth|kids|boys|girls/.test(key)) return BANNER.kids;
  if (/women/.test(key)) return BANNER.women;
  if (/men/.test(key)) return BANNER.men;
  if (/new|best-seller|street/.test(key)) return BANNER.next;

  return BANNER.shop;
}
