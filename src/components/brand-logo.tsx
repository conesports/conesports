import Image from "next/image";

const HEADER = {
  dark: "/images/cone-logo-dark.png",
  light: "/images/cone-logo-white.png",
  width: 1269,
  height: 1525,
} as const;

const MARK = {
  dark: "/images/conesport-logo-dark.png",
  light: "/images/conesport-logo-white.png",
  width: 2400,
  height: 2688,
} as const;

export function BrandLogo({
  variant,
  layout = "header",
  className = "",
  priority = false,
}: {
  variant: "dark" | "light";
  layout?: "header" | "wide" | "mark";
  className?: string;
  priority?: boolean;
}) {
  const asset = layout === "mark" ? MARK : HEADER;
  const sizeClass = "h-10 w-auto object-contain md:h-11";

  return (
    <Image
      src={asset[variant]}
      alt="ConeSports"
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={className ? `w-auto object-contain ${className}` : sizeClass}
    />
  );
}
