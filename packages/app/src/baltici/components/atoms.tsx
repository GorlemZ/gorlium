import type { CSSProperties, ReactNode } from "react";
import type { Person } from "../model";
import { formatEuro } from "../money";

const mono = "'Space Mono', monospace";

// The Baltici area renders light text on a dark background, so a "filled"
// (active/primary) control must be light-bg + dark-text — using currentColor for
// both would be light-on-light and invisible.
export const PAPER = "#ece7dd";
export const INK = "#15140f";

export function PersonAvatar({ person, size = 30 }: { person: Person; size?: number }) {
  const initial = person.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: person.color,
        color: "#fff",
        font: `700 ${Math.round(size * 0.42)}px/1 ${mono}`,
      }}
    >
      {initial}
    </span>
  );
}

/** Signed money: positive = credit (green), negative = debt (red), 0 = muted. */
export function Money({ cents, bold = false }: { cents: number; bold?: boolean }) {
  const color = cents > 0 ? "#3b7d3b" : cents < 0 ? "#a83232" : "inherit";
  return (
    <span style={{ font: `${bold ? 700 : 400} 14px/1 ${mono}`, color }}>
      {formatEuro(cents)}
    </span>
  );
}

export function Row({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderTop: "1px solid currentColor",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: "1.5px dashed currentColor",
        padding: 24,
        textAlign: "center",
        font: `400 14px/1.6 ${mono}`,
        opacity: 0.8,
        margin: "16px 0",
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ font: `700 13px/1 ${mono}`, letterSpacing: ".14em", textTransform: "uppercase", margin: "24px 0 4px" }}>
      {children}
    </h2>
  );
}
