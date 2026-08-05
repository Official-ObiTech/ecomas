import { ReactNode } from "react";

type Width = "sm" | "md" | "lg" | "xl" | "full";

const widthMap: Record<Width, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

interface ContainerProps {
  children: ReactNode;
  width?: Width;
  className?: string;
}

export function Container({ children, width = "xl", className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${widthMap[width]} ${className}`}>
      {children}
    </div>
  );
}