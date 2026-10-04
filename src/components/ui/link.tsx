import type { ReactNode } from "react";
import NextLink from "next/link";

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function Link({ href, children, className = "" }: LinkProps) {
  return (
    <NextLink href={href} className={`link ${className}`.trim()}>
      {children}
    </NextLink>
  );
}
