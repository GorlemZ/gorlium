// Baltici — reactive store hook over InstantDB. No Context: `db` is a module
// singleton and reactivity comes from db.useQuery. The rest of the app works on
// the plain GroupState (model.ts), unaware of InstantDB.

import { id } from "@instantdb/react";
import { useMemo } from "react";
import { db } from "./db";
import { balances, simplifyDebts, totals, type Settlement } from "./calc";
import {
  type Expense,
  type GroupState,
  type Person,
  type PersonId,
  personIdsInExpense,
} from "./model";
import { pickColor } from "./colors";
import {
  validateExpense,
  type ExpenseDraft,
  type ExpenseValidationError,
} from "./validation";

interface RawRow {
  [key: string]: unknown;
}

// The group is a singleton (D2: one group), so its `meta` row uses a FIXED id.
// Every setGroupName upserts that same row — otherwise, while the reactive query
// lags behind the first write, `?? id()` would mint a new row per keystroke.
const META_ID = "ba17c100-0000-4000-8000-000000000001";

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function mapExpense(r: RawRow): Expense | null {
  const idv = r.id;
  const payerId = r.payerId;
  if (typeof idv !== "string" || typeof payerId !== "string") return null;

  const base = {
    id: idv,
    description: str(r.description),
    amountCents: num(r.amountCents),
    payerId,
    date: str(r.date),
    createdAt: num(r.createdAt),
  };

  if (r.splitMode === "exact") {
    const shares = (r.exactShares ?? {}) as Record<string, unknown>;
    const exactShares: Record<PersonId, number> = {};
    for (const [k, v] of Object.entries(shares)) exactShares[k] = num(v);
    return { ...base, splitMode: "exact", exactShares };
  }

  const participants = Array.isArray(r.participants)
    ? (r.participants.filter((x) => typeof x === "string") as PersonId[])
    : [];
  return { ...base, splitMode: "equal", participants };
}

/** Pure mapper: InstantDB query result → GroupState. People ordered by
 *  createdAt (canonical), soft-deleted rows filtered out. */
export function toGroupState(data: {
  people?: RawRow[];
  expenses?: RawRow[];
  meta?: RawRow[];
}): GroupState {
  const people: Person[] = (data.people ?? [])
    .filter((r) => r.deleted !== true && typeof r.id === "string")
    .map((r) => ({
      id: r.id as string,
      name: str(r.name),
      color: str(r.color, "#888"),
      createdAt: num(r.createdAt),
    }))
    .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1));

  const expenses: Expense[] = (data.expenses ?? [])
    .filter((r) => r.deleted !== true)
    .map(mapExpense)
    .filter((e): e is Expense => e !== null)
    .sort((a, b) => b.createdAt - a.createdAt); // newest first (list view)

  // Singleton group row lives at META_ID; fall back to the first row for any
  // legacy/leftover meta row so the name is read deterministically.
  const metaRows = data.meta ?? [];
  const metaRow = metaRows.find((r) => r.id === META_ID) ?? metaRows[0];
  const name = str(metaRow?.groupName);
  return { name, people, expenses };
}

export interface BalticiActions {
  setGroupName(name: string): void;
  addPerson(name: string): void;
  renamePerson(personId: PersonId, name: string): void;
  /** Returns false (and does nothing) if the person is referenced by any expense. */
  removePerson(personId: PersonId): boolean;
  canRemovePerson(personId: PersonId): boolean;
  addExpense(draft: ExpenseDraft): ExpenseValidationError | null;
  updateExpense(
    expenseId: PersonId,
    draft: ExpenseDraft
  ): ExpenseValidationError | null;
  removeExpense(expenseId: string): void;
}

export interface UseBalticiResult {
  isLoading: boolean;
  error: string | null;
  state: GroupState;
  balances: Record<PersonId, number>;
  totals: { perPerson: Record<PersonId, number>; grand: number };
  settlements: Settlement[];
  actions: BalticiActions;
}

export function useBaltici(): UseBalticiResult {
  // Pages using this hook only mount when InstantDB is configured (BalticiLayout
  // gates on isConfigured), so db is non-null here.
  const database = db!;
  const { isLoading, error, data } = database.useQuery({
    people: {},
    expenses: {},
    meta: {},
  });

  // A query error (e.g. denied read permissions) is a real failure — surface it
  // via the layout's ErrorBoundary instead of rendering a misleading empty group.
  if (error) throw new Error(error.message ?? "InstantDB query failed");

  const state = useMemo(
    () => toGroupState((data ?? {}) as Parameters<typeof toGroupState>[0]),
    [data]
  );

  const derived = useMemo(() => {
    const net = balances(state);
    return { net, totals: totals(state), settlements: simplifyDebts(net) };
  }, [state]);

  const actions = useMemo<BalticiActions>(() => {
    const peopleIds = () => new Set(state.people.map((p) => p.id));

    const buildRow = (draft: ExpenseDraft, createdAt: number, delId?: string) => {
      const common = {
        description: draft.description.trim(),
        amountCents: draft.amountCents,
        payerId: draft.payerId,
        date: draft.date,
        splitMode: draft.splitMode,
        createdAt,
        deleted: false,
      };
      const full =
        draft.splitMode === "equal"
          ? { ...common, participants: draft.participants, exactShares: {} }
          : { ...common, participants: [], exactShares: draft.exactShares };
      return database.tx.expenses[delId ?? id()].update(full);
    };

    const writeExpense = (
      draft: ExpenseDraft,
      existingId?: string
    ): ExpenseValidationError | null => {
      const err = validateExpense(draft, peopleIds());
      if (err) return err;
      const createdAt = existingId
        ? state.expenses.find((e) => e.id === existingId)?.createdAt ?? 0
        : nowStamp(state);
      database.transact(buildRow(draft, createdAt, existingId));
      return null;
    };

    return {
      setGroupName(name) {
        database.transact(
          database.tx.meta[META_ID].update({ groupName: name })
        );
      },
      addPerson(name) {
        const trimmed = name.trim();
        if (trimmed === "") return;
        database.transact(
          database.tx.people[id()].update({
            name: trimmed,
            color: pickColor(state.people.length),
            createdAt: nowStamp(state),
            deleted: false,
          })
        );
      },
      renamePerson(personId, name) {
        const trimmed = name.trim();
        if (trimmed === "") return;
        database.transact(
          database.tx.people[personId].update({ name: trimmed })
        );
      },
      canRemovePerson(personId) {
        return !state.expenses.some((e) =>
          personIdsInExpense(e).includes(personId)
        );
      },
      removePerson(personId) {
        const referenced = state.expenses.some((e) =>
          personIdsInExpense(e).includes(personId)
        );
        if (referenced) return false;
        database.transact(
          database.tx.people[personId].update({ deleted: true })
        );
        return true;
      },
      addExpense(draft) {
        return writeExpense(draft);
      },
      updateExpense(expenseId, draft) {
        return writeExpense(draft, expenseId);
      },
      removeExpense(expenseId) {
        database.transact(
          database.tx.expenses[expenseId].update({ deleted: true })
        );
      },
    };
  }, [state, database]);

  return {
    isLoading,
    error: null, // query errors are thrown above and caught by the ErrorBoundary
    state,
    balances: derived.net,
    totals: derived.totals,
    settlements: derived.settlements,
    actions,
  };
}

// Monotonic-ish creation stamp without Date.now() surprises in tests: newest
// existing createdAt + 1, or a base epoch. (Real wall-clock isn't needed — only
// a stable increasing order for canonical people ordering.)
function nowStamp(state: GroupState): number {
  const stamps = [
    ...state.people.map((p) => p.createdAt),
    ...state.expenses.map((e) => e.createdAt),
    Date.now(),
  ];
  return Math.max(...stamps) + 1;
}
