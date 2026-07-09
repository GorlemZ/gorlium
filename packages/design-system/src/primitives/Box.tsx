import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

// Width vocabulary:
//  - number            → fixed px width (spacer)
//  - "full"            → width: 100%
//  - "fill"            → flex: 1 1 0 (take remaining space in an Inline row)
//  - "content"         → flex: 0 0 auto (natural width)
//  - "a/b" (fraction)  → proportional flex-basis (e.g. "1/2" = 50%)
//  - any other string  → passed through as CSS width
export type BoxWidth = number | "full" | "fill" | "content" | string;

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: number;
  width?: BoxWidth;
  height?: number | "full" | string;
}

function applyWidth(style: CSSProperties, width: BoxWidth): void {
  if (width === "full") {
    style.width = "100%";
    return;
  }
  if (width === "fill") {
    style.flex = "1 1 0";
    style.minWidth = 0;
    return;
  }
  if (width === "content") {
    style.flex = "0 0 auto";
    return;
  }
  if (typeof width === "string" && /^\d+\/\d+$/.test(width)) {
    const [a, b] = width.split("/").map(Number);
    const pct = `${(a / b) * 100}%`;
    style.flexGrow = 0;
    style.flexShrink = 0;
    style.flexBasis = pct;
    style.maxWidth = pct;
    return;
  }
  if (typeof width === "number") {
    style.width = `${width}px`;
    return;
  }
  style.width = width;
}

export function Box({
  children,
  className,
  style,
  padding,
  width,
  height,
  ...rest
}: BoxProps) {
  const computed: CSSProperties = { ...style };
  if (padding !== undefined) computed.padding = `${padding}px`;
  if (width !== undefined) applyWidth(computed, width);
  if (height !== undefined) {
    computed.height =
      height === "full"
        ? "100%"
        : typeof height === "number"
        ? `${height}px`
        : height;
  }

  return (
    <div className={className} style={computed} {...rest}>
      {children}
    </div>
  );
}

export default Box;
