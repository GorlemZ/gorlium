import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  tone?: "solid" | "accent2" | "outline";
  dot?: boolean;
}

export function Badge({ children, tone = "solid", dot }: BadgeProps) {
  return (
    <span className={`g-badge g-badge--${tone}`}>
      {dot ? <span className="g-badge__dot" /> : null}
      {children}
    </span>
  );
}

export default Badge;
