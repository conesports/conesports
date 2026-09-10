import { prisma } from "@/lib/prisma";
import { upsertCmsSetting } from "@/lib/settings";

export type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_KEY = "site_faq";

export const DEFAULT_FAQ: FaqItem[] = [
  {
    question: "How long does shipping take?",
    answer: "Domestic orders usually ship within a few business days. International timing depends on the destination and is shown after checkout.",
  },
  {
    question: "Can I change or cancel an order?",
    answer: "Contact us as soon as possible with your order number. We can help if the order has not already been packed.",
  },
  {
    question: "How do I start a return?",
    answer: "See the Refund Policy, then email us with your order number and the items you want to return.",
  },
];

function parseFaq(raw: string | null | undefined): FaqItem[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : null;
    if (!list) return null;
    const items = list
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const question = typeof row.question === "string" ? row.question.trim() : "";
        const answer = typeof row.answer === "string" ? row.answer.trim() : "";
        if (!question || !answer) return null;
        return { question, answer };
      })
      .filter((item): item is FaqItem => item !== null);
    return items;
  } catch {
    return null;
  }
}

export async function getFaqItems(): Promise<FaqItem[]> {
  try {
    const row = await prisma.storeSetting.findUnique({
      where: { key: FAQ_KEY },
      select: { value: true },
    });
    const parsed = parseFaq(row?.value);
    return parsed && parsed.length ? parsed : DEFAULT_FAQ;
  } catch {
    return DEFAULT_FAQ;
  }
}

export async function saveFaqItems(items: FaqItem[]) {
  const cleaned = items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
  await upsertCmsSetting(FAQ_KEY, JSON.stringify({ items: cleaned }), "FAQ");
  return cleaned;
}
