export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  imageAlt: string;
  tags: string[];
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "lorem-ipsum-match-day",
    title: "Lorem Ipsum on Match Day",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.",
    date: "2026-09-12",
    image: "/images/banners/football.jpg",
    imageAlt: "Football kit on a match-day pitch",
    tags: ["Match day", "Football"],
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam quis risus eget urna mollis ornare vel eu leo.",
    ],
  },
  {
    slug: "consectetur-training-notes",
    title: "Consectetur Training Notes",
    excerpt:
      "Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit amet fermentum.",
    date: "2026-08-28",
    image: "/images/banners/training.jpg",
    imageAlt: "Athletes in training kit",
    tags: ["Training", "Tips"],
    body: [
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.",
      "Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
      "Etiam porta sem malesuada magna mollis euismod. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae elit libero, a pharetra augue.",
    ],
  },
  {
    slug: "dolor-sit-street-kit",
    title: "Dolor Sit Street Kit",
    excerpt:
      "Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla.",
    date: "2026-07-15",
    image: "/images/banners/sunday.jpg",
    imageAlt: "Street-ready sportswear",
    tags: ["Street", "Style"],
    body: [
      "Vestibulum id ligula porta felis euismod semper. Sed posuere consectetur est at lobortis. Aenean lacinia bibendum nulla sed consectetur. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
      "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.",
      "Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getRecentBlogPosts(excludeSlug?: string, limit = 4) {
  return BLOG_POSTS.filter((post) => post.slug !== excludeSlug).slice(0, limit);
}

export function getBlogTags() {
  return [...new Set(BLOG_POSTS.flatMap((post) => post.tags))];
}

export function formatBlogDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00Z`));
}
