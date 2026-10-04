import type { ReactNode } from "react";

interface TextProps {
  children: ReactNode;
  as?: "p" | "span" | "small";
  className?: string;
}

export function Text({ children, as: Component = "p", className = "" }: TextProps) {
  return <Component className={`text ${className}`.trim()}>{children}</Component>;
}
