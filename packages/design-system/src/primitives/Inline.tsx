import type { CSSProperties, ReactNode } from "react";
import { alignItemsMap, pickResponsive, type Responsive, spacePx } from "../lib/layout";

export interface InlineProps {
  children?: ReactNode;
  space?: number;
  alignY?: string;
  align?: Responsive<string>;
  collapseBelow?: "tablet" | "desktop" | "wide";
  reverse?: Responsive<boolean>;
}

// Horizontal layout primitive. Proportional columns are expressed by giving
// children a Box width ("content" | "1/2" | px | "fill"); Inline only handles
// direction, gap, alignment, collapse and reverse.
export function Inline({
  children,
  space = 0,
  alignY,
  align,
  collapseBelow,
  reverse,
}: InlineProps) {
  const a = pickResponsive(align);
  const classes = ["g-inline"];
  if (collapseBelow === "desktop") classes.push("g-inline--collapse-desktop");
  if (pickResponsive(reverse)) classes.push("g-inline--reverse-desktop");

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
