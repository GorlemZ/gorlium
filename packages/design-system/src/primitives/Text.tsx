import type { CSSProperties, ReactNode } from "react";

type Align = CSSProperties["textAlign"];

export interface TitleProps {
  children?: ReactNode;
  size?: "large" | "medium" | "small";
  align?: Align;
}

export function Title({ children, size = "medium", align }: TitleProps) {
  return (
    <div className={`g-title g-title--${size}`} style={{ textAlign: align }}>
      {children}
    </div>
  );
}

export interface BodyProps {
  children?: ReactNode;
  size?: "small" | "medium" | "large";
  align?: Align;
}

export function Body({ children, size = "medium", align }: BodyProps) {
  return (
    <div className={`g-body g-body--${size}`} style={{ textAlign: align }}>
      {children}
    </div>
  );
}
