import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  const health = http.get(`${BASE}/api/health`);
  check(health, { "health 200": (r) => r.status === 200 });

  const quote = http.post(
    `${BASE}/api/checkout/quote`,
    JSON.stringify({
      items: [{ variantId: __ENV.VARIANT_ID || "missing-variant", quantity: 1 }],
      country: "NG",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(quote, {
    "quote responded": (r) => r.status === 200 || r.status === 400,
  });

  sleep(1);
}
