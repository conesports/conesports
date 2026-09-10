import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CART_SESSION_COOKIE = "cs_cart_sid";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = (await req.json()) as {
      items?: unknown;
      email?: string;
      phone?: string;
      subtotal?: number;
    };
    const items = Array.isArray(body.items) ? body.items : [];
    const jar = await cookies();
    let sessionId = jar.get(CART_SESSION_COOKIE)?.value;
    if (!sessionId) sessionId = `anon_${crypto.randomUUID()}`;

    const email =
      typeof body.email === "string" && body.email.includes("@")
        ? body.email.toLowerCase().trim()
        : session?.user?.email?.toLowerCase() ?? null;
    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
    const subtotal =
      typeof body.subtotal === "number" && body.subtotal >= 0
        ? Math.round(body.subtotal)
        : 0;

    if (items.length === 0) {
      await prisma.abandonedCart.deleteMany({
        where: { sessionId, recoveredAt: null },
      });
      const res = NextResponse.json({ ok: true, cleared: true });
      res.cookies.set(CART_SESSION_COOKIE, sessionId, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 60,
      });
      return res;
    }

    await prisma.abandonedCart.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId: session?.user?.id ?? null,
        email,
        phone,
        itemCount: items.reduce(
          (n: number, i: { quantity?: number }) => n + (i.quantity ?? 1),
          0,
        ),
        subtotal,
        items,
      },
      update: {
        userId: session?.user?.id ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        itemCount: items.reduce(
          (n: number, i: { quantity?: number }) => n + (i.quantity ?? 1),
          0,
        ),
        subtotal,
        items,
      },
    });

    const res = NextResponse.json({ ok: true, sessionId });
    res.cookies.set(CART_SESSION_COOKIE, sessionId, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Unable to sync cart" }, { status: 500 });
  }
}
