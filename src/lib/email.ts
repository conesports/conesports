import { getSetting } from "@/lib/settings";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const apiKey = await getSetting("resend_api_key");
  if (!apiKey) {
    console.warn("[email] Resend API key not configured — skipping send");
    return false;
  }

  const from =
    (await getSetting("email_from")) ||
    process.env.EMAIL_FROM?.trim() ||
    "ConeSports <orders@example.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
    return false;
  }

  return true;
}
