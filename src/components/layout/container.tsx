import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "", ...props }: ContainerProps) {
  return (
    <div className={`container ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
