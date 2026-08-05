// Baltici — edit gate (logic only; UI lives in editGateUI.tsx). A fixed secret
// word guards editing and deleting expenses; only people who know it can edit,
// everyone can still add. This is a client-side guard-rail, NOT real auth: the
// app has no login and the bundle is public, so a determined person could still
// change data via the API — it's a soft barrier against accidental/casual edits.
//
// The word is a build-time constant (VITE_BALTICI_EDIT_SECRET), so it lives on
// Netlify rather than in the public source, and isn't editable from the app.
// When the env var is unset the gate is inactive (editing open) — a safe local
// default. Unlock is session-only (in-memory): reloading the tab re-locks.

import { createContext, useContext } from "react";

/** The fixed secret word. Empty (env var unset) → gate inactive. */
export const EDIT_SECRET = (import.meta.env.VITE_BALTICI_EDIT_SECRET ?? "").trim();

interface GateCtx {
  unlocked: boolean;
  setUnlocked: (v: boolean) => void;
}
export const EditGateContext = createContext<GateCtx>({
  unlocked: false,
  setUnlocked: () => {},
});

export interface EditGate {
  /** A secret word is set → editing/deleting expenses is protected. */
  gateActive: boolean;
  /** No gate, or unlocked this session → edit/delete allowed. */
  canEdit: boolean;
  unlocked: boolean;
  /** Unlocks for the session if `word` matches the secret; returns whether it did. */
  tryUnlock: (word: string) => boolean;
  lock: () => void;
}

/** The fixed secret word combined with the session unlock state. */
export function useEditGate(): EditGate {
  const ctx = useContext(EditGateContext);
  const secret = EDIT_SECRET;
  const gateActive = secret !== "";
  return {
    gateActive,
    canEdit: !gateActive || ctx.unlocked,
    unlocked: ctx.unlocked,
    tryUnlock: (word) => {
      if (secret !== "" && word.trim() === secret) {
        ctx.setUnlocked(true);
        return true;
      }
      return false;
    },
    lock: () => ctx.setUnlocked(false),
  };
}
