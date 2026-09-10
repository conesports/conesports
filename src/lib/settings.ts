import { prisma } from "@/lib/prisma";

export type SettingGroup = "payments" | "marketing" | "store" | "shipping" | "email";

export type SettingDefinition = {
  key: string;
  label: string;
  group: SettingGroup;
  isSecret: boolean;
  envKey?: string;
};

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  {
    key: "paystack_secret_key",
    label: "Paystack secret key",
    group: "payments",
    isSecret: true,
    envKey: "PAYSTACK_SECRET_KEY",
  },
  {
    key: "paystack_public_key",
    label: "Paystack public key",
    group: "payments",
    isSecret: false,
    envKey: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  },
  {
    key: "paystack_webhook_secret",
    label: "Paystack webhook secret",
    group: "payments",
    isSecret: true,
    envKey: "PAYSTACK_WEBHOOK_SECRET",
  },
  {
    key: "ngn_per_usd",
    label: "NGN per 1 USD",
    group: "payments",
    isSecret: false,
    envKey: "NEXT_PUBLIC_NGN_PER_USD",
  },
  {
    key: "flutterwave_secret_key",
    label: "Flutterwave secret key",
    group: "payments",
    isSecret: true,
    envKey: "FLUTTERWAVE_SECRET_KEY",
  },
  {
    key: "flutterwave_public_key",
    label: "Flutterwave public key",
    group: "payments",
    isSecret: false,
    envKey: "NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY",
  },
  {
    key: "flutterwave_secret_hash",
    label: "Flutterwave webhook hash",
    group: "payments",
    isSecret: true,
    envKey: "FLUTTERWAVE_SECRET_HASH",
  },
  {
    key: "shipping_first_item_ngn",
    label: "Domestic first item (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_extra_item_ngn",
    label: "Domestic extra item (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "free_shipping_threshold_ngn",
    label: "Free shipping threshold (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_1_item_ngn",
    label: "International 1 item (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_2_item_ngn",
    label: "International 2 items (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_3_item_ngn",
    label: "International 3 items (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_4_item_ngn",
    label: "International 4 items (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_5_item_ngn",
    label: "International 5 items (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "shipping_intl_extra_item_ngn",
    label: "International extra item (₦)",
    group: "shipping",
    isSecret: false,
  },
  {
    key: "idle_cart_minutes",
    label: "Abandoned cart idle minutes",
    group: "store",
    isSecret: false,
  },
  {
    key: "resend_api_key",
    label: "Resend API key",
    group: "email",
    isSecret: true,
    envKey: "RESEND_API_KEY",
  },
  {
    key: "email_from",
    label: "From email address",
    group: "email",
    isSecret: false,
    envKey: "EMAIL_FROM",
  },
  {
    key: "contact_notify_email",
    label: "Contact form notify email",
    group: "email",
    isSecret: false,
    envKey: "ADMIN_EMAIL",
  },
];

function envFallback(envKey?: string) {
  if (!envKey) return "";
  return process.env[envKey]?.trim() ?? "";
}

function maskSecret(value: string) {
  if (!value) return "";
  return "--------";
}

export async function getSetting(key: string): Promise<string> {
  const def = SETTING_DEFINITIONS.find((d) => d.key === key);
  try {
    const row = await prisma.storeSetting.findUnique({ where: { key } });
    const dbVal = row?.value?.trim() ?? "";
    if (dbVal) return dbVal;
  } catch {
    // table may not exist yet
  }
  return envFallback(def?.envKey);
}

export type AdminSettingRow = SettingDefinition & {
  value: string;
  displayValue: string;
  hasValue: boolean;
};

export async function listSettingsForAdmin(group?: SettingGroup) {
  const defs = group
    ? SETTING_DEFINITIONS.filter((d) => d.group === group)
    : SETTING_DEFINITIONS;

  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.storeSetting.findMany({
      where: { key: { in: defs.map((d) => d.key) } },
      select: { key: true, value: true },
    });
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return defs.map((def) => {
    const dbVal = byKey.get(def.key)?.trim() ?? "";
    const envVal = envFallback(def.envKey);
    const resolved = dbVal || envVal;
    return {
      ...def,
      value: def.isSecret && resolved ? "" : resolved,
      displayValue: def.isSecret ? maskSecret(resolved) : resolved,
      hasValue: Boolean(resolved),
    } satisfies AdminSettingRow;
  });
}

export async function upsertSetting(key: string, value: string) {
  const def = SETTING_DEFINITIONS.find((d) => d.key === key);
  if (!def) throw new Error(`Unknown setting: ${key}`);

  await prisma.storeSetting.upsert({
    where: { key },
    create: {
      key,
      value: value.trim(),
      label: def.label,
      group: def.group,
      isSecret: def.isSecret,
    },
    update: {
      value: value.trim(),
      label: def.label,
      group: def.group,
      isSecret: def.isSecret,
    },
  });
}

export async function seedSettingsFromEnv() {
  let created = 0;
  for (const def of SETTING_DEFINITIONS) {
    const existing = await prisma.storeSetting.findUnique({
      where: { key: def.key },
    });
    if (existing) continue;
    const fromEnv = envFallback(def.envKey);
    if (!fromEnv) continue;
    await prisma.storeSetting.create({
      data: {
        key: def.key,
        value: fromEnv,
        label: def.label,
        group: def.group,
        isSecret: def.isSecret,
      },
    });
    created += 1;
  }
  return created;
}

export async function getSettingsMap(keys: string[]) {
  const out: Record<string, string> = {};
  await Promise.all(
    keys.map(async (key) => {
      out[key] = await getSetting(key);
    }),
  );
  return out;
}

export async function getNgnPerUsd() {
  const raw = await getSetting("ngn_per_usd");
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1600;
}

export async function getIdleCartMinutes() {
  const raw = await getSetting("idle_cart_minutes");
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 30;
}

export function idleCartCutoff(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

export async function upsertCmsSetting(key: string, value: string, label: string) {
  await prisma.storeSetting.upsert({
    where: { key },
    create: {
      key,
      value,
      label,
      group: "store",
      isSecret: false,
    },
    update: { value },
  });
}
