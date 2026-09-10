export type NavLink = {
  label: string;
  href: string;
};

export type NavColumn = {
  heading: string;
  links: NavLink[];
};

export type NavItem = {
  id: string;
  label: string;
  /** Omit href for Sports — opens the menu only. */
  href?: string;
  columns: NavColumn[];
};

function col(heading: string, links: NavLink[]): NavColumn {
  return { heading, links };
}

function shop(slug: string) {
  return `/shop/${slug}`;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "men",
    label: "Men",
    href: "/men",
    columns: [
      col("New & trending", [
        { label: "New arrivals", href: "/new-and-trending" },
        { label: "Best sellers", href: shop("men-best-sellers") },
        { label: "Just landed", href: shop("men-new") },
        { label: "Back to school", href: "/back-to-school" },
        { label: "Sale", href: "/sale" },
      ]),
      col("Shoes", [
        { label: "All shoes", href: shop("men-shoes") },
        { label: "Trainers", href: shop("men-trainers") },
        { label: "Football boots", href: shop("men-football-boots") },
        { label: "Running", href: shop("men-running-shoes") },
        { label: "Slides", href: shop("men-slides") },
      ]),
      col("Clothing", [
        { label: "All clothing", href: shop("men-clothing") },
        { label: "Jerseys", href: shop("men-jerseys") },
        { label: "Training tops", href: shop("men-training-tops") },
        { label: "Shorts", href: shop("men-shorts") },
        { label: "Tracksuits", href: shop("men-tracksuits") },
        { label: "Hoodies", href: shop("men-hoodies") },
      ]),
      col("Accessories", [
        { label: "All accessories", href: shop("men-accessories") },
        { label: "Bags", href: shop("men-bags") },
        { label: "Caps", href: shop("men-caps") },
        { label: "Socks", href: shop("men-socks") },
        { label: "Bottles", href: shop("men-bottles") },
      ]),
      col("Sports", [
        { label: "Football", href: "/sports/football" },
        { label: "Running", href: "/sports/running" },
        { label: "Training", href: "/sports/training" },
        { label: "Basketball", href: "/sports/basketball" },
      ]),
      col("Collections", [
        { label: "Match day", href: shop("men-match-day") },
        { label: "Street", href: shop("men-street") },
        { label: "Cone Club", href: "/register" },
      ]),
    ],
  },
  {
    id: "women",
    label: "Women",
    href: "/women",
    columns: [
      col("New & trending", [
        { label: "New arrivals", href: "/new-and-trending" },
        { label: "Best sellers", href: shop("women-best-sellers") },
        { label: "Just landed", href: shop("women-new") },
        { label: "Back to school", href: "/back-to-school" },
        { label: "Sale", href: "/sale" },
      ]),
      col("Shoes", [
        { label: "All shoes", href: shop("women-shoes") },
        { label: "Trainers", href: shop("women-trainers") },
        { label: "Football boots", href: shop("women-football-boots") },
        { label: "Running", href: shop("women-running-shoes") },
        { label: "Slides", href: shop("women-slides") },
      ]),
      col("Clothing", [
        { label: "All clothing", href: shop("women-clothing") },
        { label: "Jerseys", href: shop("women-jerseys") },
        { label: "Sports bras", href: shop("women-sports-bras") },
        { label: "Training tops", href: shop("women-training-tops") },
        { label: "Leggings", href: shop("women-leggings") },
        { label: "Shorts", href: shop("women-shorts") },
        { label: "Hoodies", href: shop("women-hoodies") },
      ]),
      col("Accessories", [
        { label: "All accessories", href: shop("women-accessories") },
        { label: "Bags", href: shop("women-bags") },
        { label: "Caps", href: shop("women-caps") },
        { label: "Socks", href: shop("women-socks") },
        { label: "Bottles", href: shop("women-bottles") },
      ]),
      col("Sports", [
        { label: "Football", href: "/sports/football" },
        { label: "Running", href: "/sports/running" },
        { label: "Training", href: "/sports/training" },
        { label: "Basketball", href: "/sports/basketball" },
      ]),
      col("Collections", [
        { label: "Match day", href: shop("women-match-day") },
        { label: "Street", href: shop("women-street") },
        { label: "Cone Club", href: "/register" },
      ]),
    ],
  },
  {
    id: "kids",
    label: "Kids",
    href: "/kids",
    columns: [
      col("Boys", [
        { label: "All boys", href: shop("kids-boys") },
        { label: "Shoes", href: shop("kids-boys-shoes") },
        { label: "Clothing", href: shop("kids-boys-clothing") },
        { label: "Football kits", href: shop("kids-boys-football") },
      ]),
      col("Girls", [
        { label: "All girls", href: shop("kids-girls") },
        { label: "Shoes", href: shop("kids-girls-shoes") },
        { label: "Clothing", href: shop("kids-girls-clothing") },
        { label: "Football kits", href: shop("kids-girls-football") },
      ]),
      col("Shop by age", [
        { label: "Little kids", href: shop("kids-little") },
        { label: "Youth", href: shop("kids-youth") },
        { label: "Back to school", href: "/back-to-school" },
      ]),
      col("Accessories", [
        { label: "Bags", href: shop("kids-bags") },
        { label: "Caps", href: shop("kids-caps") },
        { label: "Socks", href: shop("kids-socks") },
      ]),
      col("Sports", [
        { label: "Football", href: "/sports/football" },
        { label: "Running", href: "/sports/running" },
        { label: "Training", href: "/sports/training" },
        { label: "Basketball", href: "/sports/basketball" },
      ]),
    ],
  },
  {
    id: "back-to-school",
    label: "Back to School",
    href: "/back-to-school",
    columns: [
      col("Trending", [
        { label: "September kits", href: "/back-to-school" },
        { label: "New arrivals", href: "/new-and-trending" },
        { label: "Sale", href: "/sale" },
      ]),
      col("Shop", [
        { label: "Youth", href: shop("kids-youth") },
        { label: "Women", href: "/women" },
        { label: "Men", href: "/men" },
        { label: "Accessories", href: shop("kids-bags") },
      ]),
      col("Need", [
        { label: "Trainers", href: shop("men-trainers") },
        { label: "Bags", href: shop("kids-bags") },
        { label: "Socks", href: shop("kids-socks") },
        { label: "Caps", href: shop("kids-caps") },
      ]),
    ],
  },
  {
    id: "sale",
    label: "Sale",
    href: "/sale",
    columns: [
      col("Featured sale", [
        { label: "All sale", href: "/sale" },
        { label: "Best of sale", href: shop("sale-best") },
      ]),
      col("By who", [
        { label: "Men", href: shop("sale-men") },
        { label: "Women", href: shop("sale-women") },
        { label: "Kids", href: shop("sale-kids") },
      ]),
      col("By sport", [
        { label: "Football", href: shop("sale-football") },
        { label: "Running", href: shop("sale-running") },
        { label: "Training", href: shop("sale-training") },
      ]),
    ],
  },
  {
    id: "sports",
    label: "Sports",
    columns: [
      col("Play", [
        { label: "Football", href: "/sports/football" },
        { label: "Running", href: "/sports/running" },
        { label: "Training", href: "/sports/training" },
        { label: "Basketball", href: "/sports/basketball" },
        { label: "Golf", href: "/sports/golf" },
        { label: "Other sports", href: "/sports/other" },
      ]),
    ],
  },
  {
    id: "new-and-trending",
    label: "New & Trending",
    href: "/new-and-trending",
    columns: [
      col("What's new", [
        { label: "Just landed", href: "/new-and-trending" },
        { label: "Men", href: shop("men-new") },
        { label: "Women", href: shop("women-new") },
        { label: "Kids", href: shop("kids-youth") },
      ]),
      col("Trending now", [
        { label: "Match-day drops", href: shop("men-match-day") },
        { label: "Back to school", href: "/back-to-school" },
        { label: "Sale", href: "/sale" },
      ]),
      col("Collections", [
        { label: "Street", href: shop("men-street") },
        { label: "Cone Club", href: "/register" },
      ]),
    ],
  },
];

export type CatalogPage = {
  slug: string;
  path: string;
  title: string;
  intro: string;
  kind: "hub" | "sport" | "leaf";
  categorySlugs: string[];
  onSale?: boolean;
};

export const HUB_PAGES: CatalogPage[] = [
  {
    slug: "men",
    path: "/men",
    title: "Men",
    intro:
      "Kits, trainers, and training layers for the pitch, the gym, and the street — priced in naira.",
    kind: "hub",
    categorySlugs: [],
  },
  {
    slug: "women",
    path: "/women",
    title: "Women",
    intro:
      "Match-day and training kit made for Nigerian heat, from 5-a-side to long runs.",
    kind: "hub",
    categorySlugs: [],
  },
  {
    slug: "kids",
    path: "/kids",
    title: "Kids",
    intro: "Youth and little-kids kits for school, Sunday league, and training.",
    kind: "hub",
    categorySlugs: [],
  },
  {
    slug: "back-to-school",
    path: "/back-to-school",
    title: "Back to School",
    intro:
      "September term kits, trainers, and bags — ready before the first assembly.",
    kind: "hub",
    categorySlugs: ["kids-youth", "kids-bags", "kids-socks", "back-to-school"],
  },
  {
    slug: "sale",
    path: "/sale",
    title: "Sale",
    intro: "Marked-down ConeSports kit. Prices in naira while stocks last.",
    kind: "hub",
    categorySlugs: [],
    onSale: true,
  },
  {
    slug: "new-and-trending",
    path: "/new-and-trending",
    title: "New & Trending",
    intro: "Just landed and what people are buying this week.",
    kind: "hub",
    categorySlugs: ["men-new", "women-new", "men-best-sellers", "women-best-sellers"],
  },
];

export const SPORT_PAGES: CatalogPage[] = [
  {
    slug: "football",
    path: "/sports/football",
    title: "Football",
    intro: "Boots, jerseys, and training kit for 5-a-side, Sunday league, and the big pitch.",
    kind: "sport",
    categorySlugs: ["men-football-boots", "men-jerseys", "kids-boys-football", "kids-girls-football"],
  },
  {
    slug: "running",
    path: "/sports/running",
    title: "Running",
    intro: "Trainers and layers for the Third Mainland, City Marathon, and harmattan kilometres.",
    kind: "sport",
    categorySlugs: ["men-running-shoes", "women-running-shoes"],
  },
  {
    slug: "training",
    path: "/sports/training",
    title: "Training",
    intro: "Gym and pitch sessions — tees, shorts, and bottles that survive the humidity.",
    kind: "sport",
    categorySlugs: ["men-training-tops", "women-training-tops", "men-shorts"],
  },
  {
    slug: "basketball",
    path: "/sports/basketball",
    title: "Basketball",
    intro: "Court shoes and kit for indoor halls and outdoor runs.",
    kind: "sport",
    categorySlugs: ["men-trainers", "women-trainers"],
  },
  {
    slug: "golf",
    path: "/sports/golf",
    title: "Golf",
    intro: "Light layers and accessories for the course.",
    kind: "sport",
    categorySlugs: ["men-caps", "women-caps"],
  },
  {
    slug: "other",
    path: "/sports/other",
    title: "Other sports",
    intro: "Kit for everything else you play during the week.",
    kind: "sport",
    categorySlugs: ["men-accessories", "women-accessories"],
  },
];

const SHOP_LEAVES: CatalogPage[] = (() => {
  const seen = new Set<string>();
  const leaves: CatalogPage[] = [];
  for (const item of NAV_ITEMS) {
    for (const column of item.columns) {
      for (const link of column.links) {
        if (!link.href.startsWith("/shop/")) continue;
        const slug = link.href.slice("/shop/".length);
        if (seen.has(slug)) continue;
        seen.add(slug);
        leaves.push({
          slug,
          path: link.href,
          title: link.label,
          intro: `Shop ${link.label.toLowerCase()} at ConeSports. Prices in naira. Ships nationwide.`,
          kind: "leaf",
          categorySlugs: [slug],
        });
      }
    }
  }
  return leaves;
})();

export function getHubPage(slug: string) {
  const page = HUB_PAGES.find((p) => p.slug === slug) ?? null;
  if (!page) return null;
  if (page.categorySlugs.length === 0 && ["men", "women", "kids"].includes(page.slug)) {
    return { ...page, categorySlugs: shopSlugsForHub(page.slug) };
  }
  return page;
}

export function getSportPage(slug: string) {
  return SPORT_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getShopLeaf(slug: string) {
  return SHOP_LEAVES.find((p) => p.slug === slug) ?? null;
}

export function shopSlugsForHub(hubId: string) {
  const item = NAV_ITEMS.find((n) => n.id === hubId);
  if (!item) return [];
  return item.columns
    .flatMap((c) => c.links)
    .map((l) => l.href)
    .filter((href) => href.startsWith("/shop/"))
    .map((href) => href.slice("/shop/".length));
}

export function footerProductLinks(): NavLink[] {
  return [
    { label: "Shop all", href: "/shop" },
    { label: "Men's kit", href: "/men" },
    { label: "Women's kit", href: "/women" },
    { label: "Kids", href: "/kids" },
    { label: "Sale", href: "/sale" },
  ];
}

export function footerSportLinks(): NavLink[] {
  return SPORT_PAGES.map((p) => ({ label: p.title, href: p.path }));
}
