import { revalidatePath } from "next/cache";

export function revalidateCatalog(opts?: {
  productSlug?: string;
  categorySlugs?: string[];
}) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[category]", "page");
  if (opts?.productSlug) {
    revalidatePath(`/product/${opts.productSlug}`);
  }
  for (const slug of opts?.categorySlugs ?? []) {
    revalidatePath(`/shop/${slug}`);
  }
}
