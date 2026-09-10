import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  listSettingsForAdmin,
  seedSettingsFromEnv,
  upsertSetting,
  SETTING_DEFINITIONS,
} from "@/lib/settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await seedSettingsFromEnv();
  const items = await listSettingsForAdmin();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates =
    body && typeof body === "object" && "settings" in body
      ? (body as { settings: Record<string, string> }).settings
      : (body as Record<string, string>);

  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const known = new Set(SETTING_DEFINITIONS.map((d) => d.key));
  for (const [key, raw] of Object.entries(updates)) {
    if (!known.has(key) || typeof raw !== "string") continue;
    const def = SETTING_DEFINITIONS.find((d) => d.key === key)!;
    if (def.isSecret && raw.trim() === "") continue;
    await upsertSetting(key, raw);
  }

  const items = await listSettingsForAdmin();
  return NextResponse.json({ items });
}
