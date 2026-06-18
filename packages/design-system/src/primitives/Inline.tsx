import { CSSProperties, ReactNode } from "react";
import { alignItemsMap, pickResponsive, Responsive, spacePx } from "../lib/layout";

export interface InlineProps {
  children?: ReactNode;
  space?: number;
  alignY?: string;
  align?: Responsive<string>;
  collapseBelow?: "tablet" | "desktop" | "wide";
  reverse?: Responsive<boolean>;
}

export function Inline({
  children,
  space = 0,
  alignY,
  align,
  collapseBelow,
}: InlineProps) {
  const a = pickResponsive(align);
  const classes = ["g-inline"];
  if (collapseBelow === "desktop") classes.push("g-inline--collapse-desktop");

  const style: CSSProperties = {
    gap: spacePx(space),
    alignItems: alignY ? alignItemsMap[alignY] ?? alignY : undefined,
    justifyContent: a ? alignItemsMap[a] ?? a : undefined,
  };
  return (
    <div className={classes.join(" ")} style={style}>
      {children}
    </div>
  );
}

export default Inline;
