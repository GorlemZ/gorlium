// Baltici — "I've settled up" modal. Open to everyone (no secret word): pick one
// of the current who-owes lines (pairs with a pending claim are already filtered
// out by the caller), say how it was settled, submit → a PENDING payment.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Person } from "../model";
import type { Settlement } from "../calc";
import type { PaymentDraft } from "../validation";
import { formatEuro } from "../money";
import { PersonAvatar, PAPER, INK } from "./atoms";

const mono = "'Space Mono', monospace";

export function SettleUpModal({
  people,
  available,
  onSubmit,
  onClose,
}: {
  people: Person[];
  /** who-owes lines still claimable (no pending payment for the pair) */
  available: Settlement[];
  /** returns true when the claim was recorded */
  onSubmit: (draft: PaymentDraft) => boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<number | null>(null);
  const [method, setMethod] = useState("");
  const [error, setError] = useState<string | null>(null);

  const byId = (id: string): Person | undefined =>
    people.find((p) => p.id === id);

  const submit = () => {
    if (picked === null || !available[picked]) {
      setError(t("baltici.settle.errPick"));
      return;
    }
    if (method.trim() === "") {
      setError(t("baltici.settle.errMethod"));
      return;
    }
    const line = available[picked];
    const ok = onSubmit({
      fromId: line.fromId,
      toId: line.toId,
      amountCents: line.amountCents,
      method,
    });
    if (!ok) {
      setError(t("baltici.settle.errGeneric"));
      return;
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("baltici.settle.modalTitle")}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: INK,
          color: PAPER,
          border: `1.5px solid ${PAPER}`,
          padding: 20,
          width: "100%",
          maxWidth: 460,
          maxHeight: "85vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ font: `700 13px/1 ${mono}`, letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 14px" }}>
          {t("baltici.settle.modalTitle")}
        </h3>

        <div style={{ font: `700 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.75, marginBottom: 6 }}>
          {t("baltici.settle.pickDebt")}
        </div>

        {available.length === 0 && (
          <p style={{ font: `400 13px/1.5 ${mono}`, opacity: 0.75 }}>
            {t("baltici.settle.noDebts")}
          </p>
        )}

        <div style={{ display: "grid", gap: 6 }}>
          {available.map((line, i) => {
            const from = byId(line.fromId);
            const to = byId(line.toId);
            if (!from || !to) return null;
            const on = picked === i;
            return (
              <button
                key={`${line.fromId}-${line.toId}`}
                type="button"
                onClick={() => {
                  setPicked(i);
                  setError(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  font: `${on ? 700 : 400} 13px/1 ${mono}`,
                  padding: "9px 10px",
                  border: "1.5px solid currentColor",
                  background: on ? PAPER : "transparent",
                  color: on ? INK : "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <PersonAvatar person={from} size={22} />
                <span>{from.name}</span>
                <span style={{ opacity: 0.6 }}>→</span>
                <PersonAvatar person={to} size={22} />
                <span style={{ flex: 1 }}>{to.name}</span>
                <span style={{ fontWeight: 700 }}>{formatEuro(line.amountCents)}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ font: `700 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.75, marginBottom: 6 }}>
            {t("baltici.settle.method")}
          </div>
          <input
            value={method}
            placeholder={t("baltici.settle.methodPlaceholder")}
            onChange={(e) => {
              setMethod(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={{
              font: `400 14px/1 ${mono}`,
              padding: "9px 10px",
              border: "1.5px solid currentColor",
              background: "transparent",
              color: "inherit",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ font: `700 12px/1.4 ${mono}`, color: "#e08b8b", marginTop: 10 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={submit}
            disabled={available.length === 0}
            style={{
              font: `700 13px/1 ${mono}`,
              border: `1.5px solid ${PAPER}`,
              background: PAPER,
              color: INK,
              padding: "11px 16px",
              cursor: available.length === 0 ? "not-allowed" : "pointer",
              opacity: available.length === 0 ? 0.5 : 1,
            }}
          >
            {t("baltici.settle.submit")}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              font: `400 13px/1 ${mono}`,
              border: "1.5px solid currentColor",
              background: "transparent",
              color: "inherit",
              padding: "11px 16px",
              cursor: "pointer",
            }}
          >
            {t("baltici.settle.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
