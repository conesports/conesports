import { getSetting } from "@/lib/settings";

type PaystackInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

type PaystackVerifyResult = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata?: { orderId?: string };
};

async function secretKey() {
  const key = (await getSetting("paystack_secret_key")).trim();
  if (!key) {
    throw new Error("Paystack secret key is not configured");
  }
  return key;
}

export async function initializePaystackTransaction(opts: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
  currency?: "NGN" | "USD";
}): Promise<PaystackInitResult> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amount,
      currency: opts.currency ?? "NGN",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      metadata: {
        orderId: opts.orderId,
        custom_fields: [
          {
            display_name: "Order",
            variable_name: "order_id",
            value: opts.orderId,
          },
        ],
      },
    }),
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Paystack initialize failed");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${await secretKey()}` },
      cache: "no-store",
    },
  );

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      metadata?: { orderId?: string };
    };
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack verify failed");
  }

  return {
    status: json.data.status,
    reference: json.data.reference,
    amount: json.data.amount,
    currency: json.data.currency,
    metadata: json.data.metadata,
  };
}
