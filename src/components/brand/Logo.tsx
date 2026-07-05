import Link from "next/link";
import { siteConfig } from "@/config/site";

type Size = "sm" | "md" | "lg";
const tileSize: Record<Size, string> = { sm: "h-7 w-7 text-sm", md: "h-8 w-8 text-base", lg: "h-10 w-10 text-lg" };
const nameSize: Record<Size, string> = { sm: "text-base", md: "text-lg", lg: "text-xl" };

interface LogoProps {
  href?: string;
  size?: Size;
  withName?: boolean;
  className?: string;
}

export default function Logo({ href, size = "md", withName = true, className = "" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`grid place-items-center rounded-lg bg-ink font-serif font-semibold text-cream ${tileSize[size]}`}>
        {siteConfig.name.charAt(0)}
      </span>
      {withName && (
        <span className={`font-serif tracking-tight ${nameSize[size]}`}>{siteConfig.name}</span>
      )}
    </span>
  );
  return href ? <Link href={href} className="inline-flex items-center">{content}</Link> : content;
}