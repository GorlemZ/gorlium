// Money helpers — parsing user input to integer cents and formatting back.

export type ParseResult = { cents: number } | { error: ParseError };
export type ParseError = "empty" | "invalid" | "nonpositive";

/**
 * Parse a user-typed amount (EUR) into integer cents.
 * Accepts a comma or dot as decimal separator, max 2 decimals.
 * Rejects empty, non-numeric, negative and zero.
 */
export function parseAmountToCents(raw: string): ParseResult {
  const s = raw.trim().replace(/\s/g, "");
  if (s === "") return { error: "empty" };

  const normalized = s.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return { error: "invalid" };

  const cents = Math.round(parseFloat(normalized) * 100);
  if (cents <= 0) return { error: "nonpositive" };
  return { cents };
}

/** Format integer cents as an Italian-style euro amount, e.g. 1250 → "12,50". */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Same but with the euro sign, e.g. "€ 12,50" (negatives → "−€ 12,50"). */
export function formatEuro(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  return `${sign}€ ${formatCents(Math.abs(cents))}`;
}
