import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  csrfBlocked,
  rateLimitKindForPath,
  rateLimitResponse,
} from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const kind = rateLimitKindForPath(pathname, req.method);
  if (kind) {
    const limited = await rateLimitResponse(req, kind);
    if (limited) return limited;
  }

  if (csrfBlocked(req)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isLoggedIn = Boolean(req.auth);
  const isAdmin = req.auth?.user?.isAdmin === true;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");

  if (isAdminRoute && !isAdminLogin) {
    if (!isLoggedIn || !isAdmin) {
      const login = new URL("/admin/login", nextUrl);
      login.searchParams.set("callbackUrl", pathname);
      return Response.redirect(login);
    }
  }

  if (isAccountRoute && !isLoggedIn) {
    const login = new URL("/login", nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return Response.redirect(login);
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/auth/:path*",
    "/api/checkout/:path*",
    "/api/contact",
    "/api/cart/:path*",
    "/api/reviews",
    "/api/account/:path*",
    "/api/admin/:path*",
  ],
};
