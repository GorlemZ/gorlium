// Baltici — InstantDB client (D1). Reactive, client-side, no login.
//
// The app ID is a PUBLIC client-side identifier → provided via a build-time env
// var (same pattern as the Telegram contact form). When it's missing the app
// still loads; the layout shows a "configure" screen instead of the pages, so
// `db.useQuery` is never called without a real app ID.

import { init, i } from "@instantdb/react";

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID;

export const schema = i.schema({
  entities: {
    people: i.entity({
      name: i.string(),
      color: i.string(),
      createdAt: i.number(), // persisted canonical order (rounding is order-sensitive)
      deleted: i.boolean(), // soft-delete (permissions forbid hard delete)
    }),
    expenses: i.entity({
      description: i.string(),
      amountCents: i.number(),
      payerId: i.string(),
      date: i.string(),
      splitMode: i.string(), // "equal" | "exact"
      participants: i.json(), // PersonId[] (equal)
      exactShares: i.json(), // Record<PersonId, number> (exact)
      createdAt: i.number(),
      deleted: i.boolean(), // soft-delete
    }),
    payments: i.entity({
      fromId: i.string(), // debtor
      toId: i.string(), // creditor
      amountCents: i.number(), // frozen at claim time
      method: i.string(), // free text: PayPal, cash, …
      status: i.string(), // "pending" | "confirmed" (rejected claims are soft-deleted)
      createdAt: i.number(),
      deleted: i.boolean(), // soft-delete
    }),
    meta: i.entity({
      groupName: i.string(),
    }),
  },
});

// init() throws synchronously on a missing/malformed app ID. Since this module is
// imported at app startup (App → BalticiLayout → db), an uncaught throw here would
// blank the WHOLE gorlium site, not just Baltici. So we init defensively: on any
// failure `db` is null and the area shows its "not configured" screen — the rest of
// the site keeps working. A correct app ID initializes normally.
function createDb(): ReturnType<typeof init<typeof schema>> | null {
  if (!APP_ID) return null;
  try {
    return init({ appId: APP_ID, schema });
  } catch (err) {
    console.error(
      "Baltici: VITE_INSTANT_APP_ID is invalid — InstantDB not initialized.",
      err
    );
    return null;
  }
}

export const db = createDb();

/** True when InstantDB is initialized with a valid app ID. */
export const isConfigured = db !== null;
