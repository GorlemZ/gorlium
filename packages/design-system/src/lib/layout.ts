export type Responsive<T> = T | Record<string, T>;

export const alignItemsMap: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  stretch: "stretch",
};

// Bento-style props accept either a plain value or a {mobile,tablet,desktop,wide}
// object. Our usage is minimal, so we collapse the responsive object to a single
// representative value (preferring desktop) instead of building a full engine.
export function pickResponsive<T>(value?: Responsive<T>): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object") return value as T;
  const o = value as Record<string, T>;
  return o.desktop ?? o.tablet ?? o.mobile ?? o.wide ?? Object.values(o)[0];
}

export function spacePx(space?: number): string {
  return `${space ?? 0}px`;
}
