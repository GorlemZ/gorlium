import { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: number;
  width?: number | "full" | string;
  height?: number | "full" | string;
}

function dimension(value: number | "full" | string): string {
  if (value === "full") return "100%";
  if (typeof value === "number") return `${value}px`;
  return value;
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
  if (width !== undefined) computed.width = dimension(width);
  if (height !== undefined) computed.height = dimension(height);

  return (
    <div className={className} style={computed} {...rest}>
      {children}
    </div>
  );
}

export default Box;
