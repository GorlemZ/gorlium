// Baltici — "I've settled up" modal, opened from a who-owes row. The debt is
// already chosen (pair + amount frozen at click time by the caller); the modal
// only asks how it was settled, then creates the PENDING claim. Open to
// everyone — the secret word gates the confirmation, not the claim.

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
  line,
  onSubmit,
  onClose,
}: {
  people: Person[];
  /** the who-owes line being claimed (frozen snapshot) */
  line: Settlement;
  /** returns true when the claim was recorded */
  onSubmit: (draft: PaymentDraft) => boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from = people.find((p) => p.id === line.fromId);
  const to = people.find((p) => p.id === line.toId);

  const submit = () => {
    if (method.trim() === "") {
      setError(t("baltici.settle.errMethod"));
      return;
    }
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
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ font: `700 13px/1 ${mono}`, letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 14px" }}>
          {t("baltici.settle.modalTitle")}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            font: `400 13px/1 ${mono}`,
            padding: "9px 10px",
            border: "1.5px solid currentColor",
          }}
        >
          {from && <PersonAvatar person={from} size={22} />}
          <span>{from?.name ?? "?"}</span>
          <span style={{ opacity: 0.6 }}>→</span>
          {to && <PersonAvatar person={to} size={22} />}
          <span style={{ flex: 1 }}>{to?.name ?? "?"}</span>
          <span style={{ fontWeight: 700 }}>{formatEuro(line.amountCents)}</span>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ font: `700 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.75, marginBottom: 6 }}>
            {t("baltici.settle.method")}
          </div>
          <input
            autoFocus
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
            style={{
              font: `700 13px/1 ${mono}`,
              border: `1.5px solid ${PAPER}`,
              background: PAPER,
              color: INK,
              padding: "11px 16px",
              cursor: "pointer",
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
