import { appUrl } from "@/lib/money";

const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export type RateLimitKind = "auth" | "checkout" | "contact" | "login";

const LIMITS: Record<RateLimitKind, { limit: number; windowMs: number }> = {
  auth: { limit: 20, windowMs: 60_000 },
  login: { limit: 10, windowMs: 60_000 },
  checkout: { limit: 30, windowMs: 60_000 },
  contact: { limit: 8, windowMs: 60_000 },
};

async function upstashIncr(key: string, windowMs: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(windowMs), "NX"],
    ]),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: { result?: number }[] };
  const count = data.result?.[0]?.result;
  return typeof count === "number" ? count : null;
}

function memoryIncr(key: string, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function rateLimit(req: Request, kind: RateLimitKind) {
  const { limit, windowMs } = LIMITS[kind];
  const key = `rl:${kind}:${clientIp(req)}`;
  const count = (await upstashIncr(key, windowMs)) ?? memoryIncr(key, windowMs);
  return {
    ok: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
  };
}

export async function rateLimitResponse(req: Request, kind: RateLimitKind) {
  const result = await rateLimit(req, kind);
  if (result.ok) return null;
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": "60",
    },
  });
}

export function rateLimitKindForPath(pathname: string, method: string): RateLimitKind | null {
  if (method !== "POST" && method !== "PUT" && method !== "PATCH") return null;
  if (pathname.startsWith("/api/checkout")) return "checkout";
  if (pathname === "/api/contact") return "contact";
  if (pathname.startsWith("/api/auth/callback/credentials")) return "login";
  if (pathname.startsWith("/api/auth")) return "auth";
  return null;
}

export function csrfBlocked(req: Request) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;

  const pathname = new URL(req.url).pathname;
  if (pathname.startsWith("/api/webhooks")) return false;
  if (pathname.startsWith("/api/auth")) return false;
  if (pathname === "/api/health") return false;
  if (!pathname.startsWith("/api/")) return false;

  const origin = req.headers.get("origin");
  const allowed = appUrl();
  if (origin) {
    try {
      return new URL(origin).origin !== new URL(allowed).origin;
    } catch {
      return true;
    }
  }

  const site = req.headers.get("sec-fetch-site");
  return site === "cross-site";
}
