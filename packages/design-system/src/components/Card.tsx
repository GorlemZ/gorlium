import type { ReactNode } from "react";

export interface CardProps {
  title?: ReactNode;
  emphasis?: "default" | "accent" | "quiet";
  children?: ReactNode;
}

export function Card({ title, emphasis = "default", children }: CardProps) {
  return (
    <div className={`g-card g-card--${emphasis}`}>
      {title != null ? <div className="g-card__header">{title}</div> : null}
      <div className="g-card__body">{children}</div>
    </div>
  );
}

export default Card;
