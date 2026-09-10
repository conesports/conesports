import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["h2", "h3", "p", "strong", "b", "em", "ul", "ol", "li", "a", "br"];

/** Keep headings, bold, lists, and links only. */
export function sanitizeSitePageHtml(input: string) {
  return DOMPurify.sanitize(input.replace(/\0/g, ""), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/|#)/i,
  }).trim();
}

export function htmlToPlainPreview(html: string, max = 140) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
