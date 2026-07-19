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

export interface GroupState {
  name: string;
  people: Person[]; // canonical order (by createdAt) — see calc.shareOf
  expenses: Expense[];
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
