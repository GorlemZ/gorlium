// Baltici — pure calculation engine. No React, no storage. Integer cents only.
//
// Invariants (covered by calc.test.ts):
//   - for every expense, sum(shareOf) === amountCents (no cent created/lost)
//   - sum(balances) === 0
//   - simplifyDebts fully zeroes every balance, no negative payments
//   - rounding is deterministic and independent of participants[] ordering

import {
  type Expense,
  type GroupState,
  type Person,
  type PersonId,
} from "./model";

function orderIndex(people: Person[]): Map<PersonId, number> {
  const m = new Map<PersonId, number>();
  people.forEach((p, i) => m.set(p.id, i));
  return m;
}

/**
 * Amount owed by each participant of a single expense, in integer cents.
 * equal: split evenly; the remainder (0..n-1 cents) is handed out one cent each
 * following the canonical order of `people` (NOT the order of participants[],
 * which depends on toggle order) → same logical subset ⇒ same assignment.
 * exact: returns exactShares as-is.
 */
export function shareOf(
  expense: Expense,
  people: Person[]
): Record<PersonId, number> {
  if (expense.splitMode === "exact") {
    return { ...expense.exactShares };
  }

  const parts = expense.participants;
  if (parts.length === 0) {
    // Illegal state (validation prevents saving it); fail fast, never /0.
    throw new Error("equal expense with no participants");
  }

  const order = orderIndex(people);
  const sorted = [...parts].sort(
    (a, b) =>
      (order.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b) ?? Number.MAX_SAFE_INTEGER)
  );

  const n = sorted.length;
  const base = Math.floor(expense.amountCents / n);
  const remainder = expense.amountCents - base * n; // 0..n-1

  const out: Record<PersonId, number> = {};
  sorted.forEach((pid, idx) => {
    out[pid] = base + (idx < remainder ? 1 : 0);
  });
  return out;
}

/**
 * Net balance per person over all expenses, in cents.
 * net = sum(paid as payer) − sum(owed shares).
 * > 0 → in credit (the group owes them), < 0 → in debt.
 */
export function balances(state: GroupState): Record<PersonId, number> {
  const net: Record<PersonId, number> = {};
  for (const p of state.people) net[p.id] = 0;

  for (const e of state.expenses) {
    net[e.payerId] = (net[e.payerId] ?? 0) + e.amountCents;
    const shares = shareOf(e, state.people);
    for (const [pid, share] of Object.entries(shares)) {
      net[pid] = (net[pid] ?? 0) - share;
    }
  }
  return net;
}

/** Total paid (as payer) per person + grand total of the trip, in cents. */
export function totals(state: GroupState): {
  perPerson: Record<PersonId, number>;
  grand: number;
} {
  const perPerson: Record<PersonId, number> = {};
  for (const p of state.people) perPerson[p.id] = 0;

  let grand = 0;
  for (const e of state.expenses) {
    perPerson[e.payerId] = (perPerson[e.payerId] ?? 0) + e.amountCents;
    grand += e.amountCents;
  }
  return { perPerson, grand };
}

export interface Settlement {
  fromId: PersonId;
  toId: PersonId;
  amountCents: number;
}

/**
 * Minimal-ish set of payments that zero out the net balances (greedy
 * two-pointer: largest debtor pays largest creditor). Deterministic thanks to
 * a stable sort by amount then id.
 */
export function simplifyDebts(net: Record<PersonId, number>): Settlement[] {
  const creditors: { id: PersonId; amt: number }[] = [];
  const debtors: { id: PersonId; amt: number }[] = [];

  for (const [id, amt] of Object.entries(net)) {
    if (amt > 0) creditors.push({ id, amt });
    else if (amt < 0) debtors.push({ id, amt: -amt });
  }

  const byAmountThenId = (
    a: { id: PersonId; amt: number },
    b: { id: PersonId; amt: number }
  ) => b.amt - a.amt || (a.id < b.id ? -1 : 1);
  creditors.sort(byAmountThenId);
  debtors.sort(byAmountThenId);

  const out: Settlement[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const pay = Math.min(c.amt, d.amt);
    if (pay > 0) out.push({ fromId: d.id, toId: c.id, amountCents: pay });
    c.amt -= pay;
    d.amt -= pay;
    if (c.amt === 0) ci++;
    if (d.amt === 0) di++;
  }
  return out;
}
