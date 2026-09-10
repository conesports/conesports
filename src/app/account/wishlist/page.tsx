import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistView } from "@/components/wishlist-view";

export default async function WishlistPage() {
  const session = await auth();
  const items = session?.user?.id
    ? await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { product: { include: { variants: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Wishlist</h1>
      <WishlistView
        items={items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          slug: i.product.slug,
          image: i.product.images[0] ?? "",
          price: i.product.price,
          discountPercent: i.product.discountPercent,
          variantId: i.product.variants[0]?.id ?? "",
          size: i.product.variants[0]?.size ?? "",
          color: i.product.variants[0]?.color ?? "",
        }))}
      />
    </section>
  );
}
