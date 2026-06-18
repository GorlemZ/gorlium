import { CSSProperties, ReactNode } from "react";
import { alignItemsMap, pickResponsive, Responsive, spacePx } from "../lib/layout";

export interface StackProps {
  children?: ReactNode;
  space?: number;
  align?: Responsive<string>;
  dividers?: boolean;
}

export function Stack({ children, space = 0, align, dividers }: StackProps) {
  const a = pickResponsive(align);
  const style: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacePx(space),
    alignItems: a ? alignItemsMap[a] ?? a : undefined,
  };
  return (
    <div className={dividers ? "g-stack g-stack--dividers" : "g-stack"} style={style}>
      {children}
    </div>
  );
}

export default Stack;
