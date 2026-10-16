import type { SocialLink } from "@/lib/site-contact";

function Icon({
  network,
  className = "h-4 w-4",
}: {
  network: SocialLink["network"];
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (network) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.75A3.75 3.75 0 0 0 3.75 7.5v9a3.75 3.75 0 0 0 3.75 3.75h9a3.75 3.75 0 0 0 3.75-3.75v-9a3.75 3.75 0 0 0-3.75-3.75h-9Zm9.75 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14.5 3c.4 2.4 2 4.2 4.5 4.6v2.4c-1.5 0-2.9-.5-4.1-1.3v6.6c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1v2.5c-.3-.1-.7-.2-1-.2a3.5 3.5 0 1 0 3.5 3.5V3h2.1Z" />
        </svg>
      );
    default:
      return null;
  }
}

const iconClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:text-white";

export function SocialIconLinks({
  links = [],
  className = "",
}: {
  links?: SocialLink[];
  className?: string;
}) {
  if (!links.length) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {links.map((link) => (
        <li key={link.network}>
          {link.href ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className={iconClassName}
            >
              <Icon network={link.network} />
            </a>
          ) : (
            <span aria-label={link.label} title={link.label} className={iconClassName}>
              <Icon network={link.network} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
