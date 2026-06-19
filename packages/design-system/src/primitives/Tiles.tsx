import { CSSProperties, ReactNode } from "react";
import { spacePx } from "../lib/layout";

type TilesColumns =
  | number
  | { mobile?: number; tablet?: number; desktop?: number; wide?: number };

export interface TilesProps {
  children?: ReactNode;
  space?: number;
  columns?: TilesColumns;
}

export function Tiles({ children, space = 0, columns = 1 }: TilesProps) {
  const style: CSSProperties & Record<string, string | number> = {
    gap: spacePx(space),
  };
  if (typeof columns === "number") {
    style["--g-tiles-mobile"] = columns;
  } else {
    if (columns.mobile !== undefined) style["--g-tiles-mobile"] = columns.mobile;
    if (columns.tablet !== undefined) style["--g-tiles-tablet"] = columns.tablet;
    if (columns.desktop !== undefined) style["--g-tiles-desktop"] = columns.desktop;
    if (columns.wide !== undefined) style["--g-tiles-wide"] = columns.wide;
  }
  return (
    <div className="g-tiles" style={style}>
      {children}
    </div>
  );
}

export default Tiles;
