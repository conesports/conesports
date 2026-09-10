import { getSetting } from "@/lib/settings";

async function secretKey() {
  const key = (await getSetting("flutterwave_secret_key")).trim();
  if (!key) throw new Error("Flutterwave secret key is not configured");
  return key;
}

export async function initializeFlutterwavePayment(opts: {
  email: string;
  name: string;
  phone?: string;
  amountMajor: number;
  currency: "USD" | "NGN";
  txRef: string;
  redirectUrl: string;
  orderId: string;
}) {
  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: opts.txRef,
      amount: opts.amountMajor,
      currency: opts.currency,
      redirect_url: opts.redirectUrl,
      customer: {
        email: opts.email,
        name: opts.name,
        phonenumber: opts.phone,
      },
      meta: { orderId: opts.orderId },
      customizations: {
        title: "ConeSports",
        description: `Order ${opts.orderId.slice(-8).toUpperCase()}`,
      },
    }),
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };

  if (!res.ok || json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || "Flutterwave initialize failed");
  }

  return { authorizationUrl: json.data.link, reference: opts.txRef };
}

export async function verifyFlutterwaveByReference(txRef: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    {
      headers: { Authorization: `Bearer ${await secretKey()}` },
      cache: "no-store",
    },
  );

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    data?: {
      status?: string;
      tx_ref?: string;
      amount?: number;
      currency?: string;
      meta?: { orderId?: string };
    };
  };

  if (!res.ok || json.status !== "success" || !json.data) {
    throw new Error(json.message || "Flutterwave verify failed");
  }

  return {
    status: json.data.status ?? "",
    reference: json.data.tx_ref ?? txRef,
    amount: json.data.amount ?? 0,
    currency: json.data.currency ?? "",
    orderId: json.data.meta?.orderId,
  };
}

export async function flutterwaveWebhookHash() {
  return (await getSetting("flutterwave_secret_hash")).trim();
}
