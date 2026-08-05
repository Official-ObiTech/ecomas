import { ElementType, ReactNode } from "react";

type Size = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type Weight = "normal" | "medium" | "semibold" | "bold";
type Align = "left" | "center" | "right";
type Font = "sans" | "serif";

const sizeMap: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const weightMap: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const alignMap: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

interface TextProps {
  children: ReactNode;
  as?: ElementType;
  size?: Size;
  weight?: Weight;
  italic?: boolean;
  align?: Align;
  font?: Font;
  color?: string;      // any CSS color OR a token like "var(--color-muted)"
  className?: string;
  htmlFor?: string;
}

export function Text({
  children,
  as: Tag = "p",
  size = "base",
  weight = "normal",
  italic = false,
  align = "left",
  font = "sans",
  color,
  className = "",
  htmlFor,
}: TextProps) {
  return (
    <Tag
      htmlFor={htmlFor}
      style={{
        color: color,
        fontFamily: font === "serif" ? "var(--font-serif)" : "var(--font-sans)",
      }}
      className={[
        sizeMap[size],
        weightMap[weight],
        alignMap[align],
        italic ? "italic" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}