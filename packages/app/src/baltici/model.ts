// Baltici — domain model (Splitwise light).
//
// A single group, no login, no "current user". All amounts are integer cents.
// The Expense type is a discriminated union so there is exactly one source of
// truth for "who shares an expense": `participants` for equal splits, the keys
// of `exactShares` for exact splits.

export type PersonId = string;
export type ExpenseId = string;

export interface Person {
  id: PersonId;
  name: string;
  color: string;
  createdAt: number; // persisted → canonical ordering (rounding is order-sensitive)
}

export type SplitMode = "equal" | "exact";

interface ExpenseBase {
  id: ExpenseId;
  description: string;
  amountCents: number; // total, integer cents, > 0
  payerId: PersonId; // chosen explicitly (no "current user")
  date: string; // "YYYY-MM-DD"
  createdAt: number;
}

export interface EqualExpense extends ExpenseBase {
  splitMode: "equal";
  participants: PersonId[]; // ≥ 1, unique; order not significant (canonicalized in calc)
}

export interface ExactExpense extends ExpenseBase {
  splitMode: "exact";
  exactShares: Record<PersonId, number>; // cents per person, sums to amountCents
}

export type Expense = EqualExpense | ExactExpense;

export type PaymentStatus = "pending" | "confirmed";

/**
 * A settle-up claim, in two phases. Anyone can create one ("I've settled up"):
 * it freezes a who-owes line (from → to, amount snapshot at click time) plus a
 * free-text method (PayPal, cash, …). It only affects balances once CONFIRMED
 * with the secret word; a rejected claim is soft-deleted without a trace.
 * A confirmed payment acts as a money transfer from → to (it is NOT an expense:
 * the trip total ignores it).
 */
export interface Payment {
  id: string;
  fromId: PersonId; // debtor (who claims they paid)
  toId: PersonId; // creditor (who received the money)
  amountCents: number; // frozen at claim time, > 0
  method: string; // how it was settled (free text)
  status: PaymentStatus;
  createdAt: number;
}

/** Everyone referenced by a payment. Blocks removing a person involved in one. */
export function personIdsInPayment(p: Payment): PersonId[] {
  return [p.fromId, p.toId];
}

export interface GroupState {
  name: string;
  people: Person[]; // canonical order (by createdAt) — see calc.shareOf
  expenses: Expense[];
  payments: Payment[];
}

/** The people who share an expense — the single source of truth per split mode. */
export function participantsOf(e: Expense): PersonId[] {
  return e.splitMode === "equal" ? e.participants : Object.keys(e.exactShares);
}

/** Every person referenced by an expense: payer + participants. Used to block
 *  removing a person who is still involved somewhere. */
export function personIdsInExpense(e: Expense): PersonId[] {
  return Array.from(new Set<PersonId>([e.payerId, ...participantsOf(e)]));
}
