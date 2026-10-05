import type { HTMLAttributes, ReactNode } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function Section({ children, className = "", ...props }: SectionProps) {
  return (
    <section className={`section ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
