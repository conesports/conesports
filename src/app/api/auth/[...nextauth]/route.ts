import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = await rateLimitResponse(req, "auth");
  if (limited) return limited;
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const kind = req.nextUrl.pathname.includes("credentials") ? "login" : "auth";
  const limited = await rateLimitResponse(req, kind);
  if (limited) return limited;
  return handlers.POST(req);
}
