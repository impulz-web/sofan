import type { ReactNode } from "react";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
}

export function Heading({ as: Component = "h2", children, className = "" }: HeadingProps) {
  return <Component className={`heading ${className}`.trim()}>{children}</Component>;
}
