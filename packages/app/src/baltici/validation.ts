// Baltici — expense/payment validation. Pure; reused by the store (guard before
// writing) and by unit tests. Prevents illegal states (e.g. equal split with no
// participants → shareOf would divide by zero; exact shares not summing to total).

import { type Payment, type PersonId } from "./model";

export interface EqualDraft {
  splitMode: "equal";
  description: string;
  amountCents: number;
  payerId: PersonId;
  date: string;
  participants: PersonId[];
}

export interface ExactDraft {
  splitMode: "exact";
  description: string;
  amountCents: number;
  payerId: PersonId;
  date: string;
  exactShares: Record<PersonId, number>;
}

export type ExpenseDraft = EqualDraft | ExactDraft;

export type ExpenseValidationError =
  | "no-description"
  | "bad-amount"
  | "bad-payer"
  | "bad-date"
  | "no-participants"
  | "bad-participants"
  | "bad-share-ids"
  | "shares-negative"
  | "shares-mismatch";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns null when valid, otherwise the first error found. */
export function validateExpense(
  draft: ExpenseDraft,
  peopleIds: ReadonlySet<PersonId>
): ExpenseValidationError | null {
  if (draft.description.trim() === "") return "no-description";
  if (!Number.isInteger(draft.amountCents) || draft.amountCents <= 0)
    return "bad-amount";
  if (!peopleIds.has(draft.payerId)) return "bad-payer";
  if (!DATE_RE.test(draft.date)) return "bad-date";

  if (draft.splitMode === "equal") {
    const parts = draft.participants;
    if (parts.length === 0) return "no-participants";
    const unique = new Set(parts);
    if (unique.size !== parts.length) return "bad-participants";
    for (const id of parts) if (!peopleIds.has(id)) return "bad-participants";
    return null;
  }

  const ids = Object.keys(draft.exactShares);
  if (ids.length === 0) return "no-participants";
  for (const id of ids) if (!peopleIds.has(id)) return "bad-share-ids";
  let sum = 0;
  for (const id of ids) {
    const share = draft.exactShares[id];
    if (!Number.isInteger(share) || share < 0) return "shares-negative";
    sum += share;
  }
  if (sum !== draft.amountCents) return "shares-mismatch";
  return null;
}

export interface PaymentDraft {
  fromId: PersonId; // debtor
  toId: PersonId; // creditor
  amountCents: number;
  method: string;
}

export type PaymentValidationError =
  | "bad-people"
  | "bad-amount"
  | "no-method"
  | "duplicate-pending";

/** Returns null when valid, otherwise the first error found. `payments` are the
 *  live (non-deleted) ones — only one PENDING claim per from→to pair may exist.
 *  NOTE: the duplicate-pending guard is client-side (no server): two devices
 *  claiming the same pair simultaneously can both pass. Realtime sync keeps the
 *  window tiny, and the confirmer simply rejects the extra claim. */
export function validatePayment(
  draft: PaymentDraft,
  peopleIds: ReadonlySet<PersonId>,
  payments: readonly Payment[]
): PaymentValidationError | null {
  if (
    !peopleIds.has(draft.fromId) ||
    !peopleIds.has(draft.toId) ||
    draft.fromId === draft.toId
  )
    return "bad-people";
  if (!Number.isInteger(draft.amountCents) || draft.amountCents <= 0)
    return "bad-amount";
  if (draft.method.trim() === "") return "no-method";
  const dup = payments.some(
    (p) =>
      p.status === "pending" &&
      p.fromId === draft.fromId &&
      p.toId === draft.toId
  );
  if (dup) return "duplicate-pending";
  return null;
}
