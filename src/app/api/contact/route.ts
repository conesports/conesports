import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getSetting } from "@/lib/settings";
import { rateLimitResponse } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(160).optional(),
  body: z.string().trim().min(10).max(4000),
});

export async function POST(req: Request) {
  const limited = await rateLimitResponse(req, "contact");
  if (limited) return limited;
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form" }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      body: parsed.data.body,
    },
  });

  const notify =
    (await getSetting("contact_notify_email")) ||
    process.env.ADMIN_EMAIL ||
    "";
  if (notify) {
    const subject = parsed.data.subject
      ? `Contact: ${parsed.data.subject}`
      : "New contact form message";
    const escape = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    await sendEmail({
      to: notify,
      subject,
      text: `${parsed.data.name} <${parsed.data.email}>\n${parsed.data.phone ?? ""}\n\n${parsed.data.body}`,
      html: `<p><strong>${escape(parsed.data.name)}</strong> &lt;${escape(parsed.data.email)}&gt;</p>${
        parsed.data.phone ? `<p>${escape(parsed.data.phone)}</p>` : ""
      }<p>${escape(parsed.data.body).replace(/\n/g, "<br />")}</p>`,
    });
  }

  return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
}
