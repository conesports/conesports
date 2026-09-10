import { getSettingsMap } from "@/lib/settings";

export type ShippingAddress = {
  country: string;
};

export type ShippingCartLine = {
  quantity: number;
};

export type ShippingConfig = {
  firstItemKobo: number;
  extraItemKobo: number;
  freeThresholdKobo: number;
  intlTiersKobo: [number, number, number, number, number];
  intlExtraKobo: number;
};

const DEFAULTS: ShippingConfig = {
  firstItemKobo: 900_000,
  extraItemKobo: 150_000,
  freeThresholdKobo: 100_000_000,
  intlTiersKobo: [8_000_000, 12_500_000, 17_000_000, 21_500_000, 26_000_000],
  intlExtraKobo: 4_500_000,
};

function ngnMajorToKobo(raw: string | undefined, fallbackMajor: number) {
  const n = Number(raw?.replace(/,/g, "").trim());
  const major = Number.isFinite(n) && n >= 0 ? n : fallbackMajor;
  return Math.round(major * 100);
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const map = await getSettingsMap([
    "shipping_first_item_ngn",
    "shipping_extra_item_ngn",
    "free_shipping_threshold_ngn",
    "shipping_intl_1_item_ngn",
    "shipping_intl_2_item_ngn",
    "shipping_intl_3_item_ngn",
    "shipping_intl_4_item_ngn",
    "shipping_intl_5_item_ngn",
    "shipping_intl_extra_item_ngn",
  ]);

  return {
    firstItemKobo: ngnMajorToKobo(map.shipping_first_item_ngn, 9000),
    extraItemKobo: ngnMajorToKobo(map.shipping_extra_item_ngn, 1500),
    freeThresholdKobo: ngnMajorToKobo(map.free_shipping_threshold_ngn, 1_000_000),
    intlTiersKobo: [
      ngnMajorToKobo(map.shipping_intl_1_item_ngn, 80_000),
      ngnMajorToKobo(map.shipping_intl_2_item_ngn, 125_000),
      ngnMajorToKobo(map.shipping_intl_3_item_ngn, 170_000),
      ngnMajorToKobo(map.shipping_intl_4_item_ngn, 215_000),
      ngnMajorToKobo(map.shipping_intl_5_item_ngn, 260_000),
    ],
    intlExtraKobo: ngnMajorToKobo(map.shipping_intl_extra_item_ngn, 45_000),
  };
}

export function isDomesticCountry(country: string) {
  return country.trim().toUpperCase() === "NG" || country.trim().toUpperCase() === "NIGERIA";
}

export function itemCount(cart: ShippingCartLine[]) {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function calculateShipping(
  cart: ShippingCartLine[],
  address: ShippingAddress,
  subtotalKobo: number,
  config: ShippingConfig,
): { shippingKobo: number; isFree: boolean; domestic: boolean } {
  const count = itemCount(cart);
  const domestic = isDomesticCountry(address.country);
  if (count <= 0) {
    return { shippingKobo: 0, isFree: false, domestic };
  }
  if (subtotalKobo >= config.freeThresholdKobo) {
    return { shippingKobo: 0, isFree: true, domestic };
  }

  if (domestic) {
    return {
      shippingKobo: config.firstItemKobo + Math.max(0, count - 1) * config.extraItemKobo,
      isFree: false,
      domestic,
    };
  }

  if (count <= 5) {
    return {
      shippingKobo: config.intlTiersKobo[count - 1],
      isFree: false,
      domestic,
    };
  }

  return {
    shippingKobo: config.intlTiersKobo[4] + (count - 5) * config.intlExtraKobo,
    isFree: false,
    domestic,
  };
}

export function selectCheckoutGateway(country: string): "paystack" | "flutterwave" {
  return isDomesticCountry(country) ? "paystack" : "flutterwave";
}
