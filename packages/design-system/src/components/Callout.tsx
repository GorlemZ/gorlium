import type { ReactNode } from "react";

export interface CalloutProps {
  title?: ReactNode;
  tone: "info" | "warning" | "error";
  children: ReactNode;
}

export function Callout({ title, tone, children }: CalloutProps) {
  return (
    <div className={`g-callout g-callout--${tone}`}>
      {title != null ? <div className="g-callout__title">{title}</div> : null}
      <div className="g-callout__body">{children}</div>
    </div>
  );
}

export default Callout;
