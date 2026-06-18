import { CSSProperties, ReactNode } from "react";
import { pickResponsive, Responsive, spacePx } from "../lib/layout";

export interface ColumnsProps {
  children?: ReactNode;
  space?: number;
  collapseBelow?: "tablet" | "desktop" | "wide";
  reverse?: Responsive<boolean>;
}

export function Columns({ children, space = 0, collapseBelow, reverse }: ColumnsProps) {
  const classes = ["g-columns"];
  if (collapseBelow === "desktop") classes.push("g-columns--collapse-desktop");
  if (pickResponsive(reverse)) classes.push("g-columns--reverse-desktop");

  return (
    <div className={classes.join(" ")} style={{ gap: spacePx(space) }}>
      {children}
    </div>
  );
}

export interface ColumnProps {
  children?: ReactNode;
  width?: "content" | string | number;
}

export function Column({ children, width }: ColumnProps) {
  let flex = "1 1 0"; // default: take remaining space
  if (width === "content") {
    flex = "0 0 auto";
  } else if (typeof width === "string" && width.includes("/")) {
    const [a, b] = width.split("/").map(Number);
    flex = `0 0 ${(a / b) * 100}%`;
  } else if (typeof width === "number") {
    flex = `0 0 ${width}px`;
  }
  const style: CSSProperties = { flex, minWidth: 0 };
  return <div style={style}>{children}</div>;
}

export default Columns;
