// Baltici — edit gate UI: the session provider and the unlock prompt.

import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EditGateContext, useEditGate } from "./editGate";
import { PAPER, INK } from "./components/atoms";

const mono = "'Space Mono', monospace";

export function EditGateProvider({ children }: { children: ReactNode }) {
  // Session-only unlock: plain in-memory state, so it resets on reload/new tab.
  const [unlocked, setUnlocked] = useState(false);
  const value = useMemo(() => ({ unlocked, setUnlocked }), [unlocked]);
  return (
    <EditGateContext.Provider value={value}>{children}</EditGateContext.Provider>
  );
}

/** Prompt to unlock editing. Renders nothing when there's no gate or already
 *  unlocked, so call sites can drop it in unconditionally. */
export function UnlockBar() {
  const { t } = useTranslation();
  const gate = useEditGate();
  const [word, setWord] = useState("");
  const [error, setError] = useState(false);

  if (!gate.gateActive || gate.unlocked) return null;

  const submit = () => {
    if (gate.tryUnlock(word)) {
      setWord("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div
      style={{
        border: "1.5px solid currentColor",
        padding: "12px 14px",
        margin: "0 0 16px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ font: `700 12px/1.4 ${mono}` }}>🔒 {t("baltici.protection.locked")}</span>
      <input
        type="password"
        value={word}
        placeholder={t("baltici.protection.wordPlaceholder")}
        onChange={(e) => {
          setWord(e.target.value);
          setError(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        style={{
          font: `400 13px/1 ${mono}`,
          padding: "8px 10px",
          border: "1.5px solid currentColor",
          background: "transparent",
          color: "inherit",
          flex: 1,
          minWidth: 120,
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        onClick={submit}
        style={{
          font: `700 12px/1 ${mono}`,
          border: `1.5px solid ${PAPER}`,
          background: PAPER,
          color: INK,
          padding: "9px 14px",
          cursor: "pointer",
        }}
      >
        {t("baltici.protection.unlock")}
      </button>
      {error && (
        <span style={{ font: `700 12px/1 ${mono}`, color: "#a83232", width: "100%" }}>
          {t("baltici.protection.wrong")}
        </span>
      )}
    </div>
  );
}
