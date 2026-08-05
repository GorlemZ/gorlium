import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { useEditGate } from "../../baltici/editGate";
import { UnlockBar } from "../../baltici/editGateUI";
import { Row, EmptyState, SectionTitle, PAPER, INK } from "../../baltici/components/atoms";
import { formatEuro } from "../../baltici/money";
import type { Payment } from "../../baltici/model";

const mono = "'Space Mono', monospace";

// The settle-up ledger: claims waiting for the secret-word decision on top,
// archived (confirmed) ones below. Claims are created from the Who owes tab.
function BalticiSettledDebts() {
  const { t } = useTranslation();
  const { state, actions } = useBaltici();
  const gate = useEditGate();

  const nameOf = (id: string) => state.people.find((p) => p.id === id)?.name ?? "?";

  const pending = state.payments.filter((p) => p.status === "pending");
  const confirmed = state.payments.filter((p) => p.status === "confirmed");

  return (
    <div>
      <SectionTitle>{t("baltici.settle.listTitle")}</SectionTitle>

      <UnlockBar />

      {state.payments.length === 0 && (
        <EmptyState>{t("baltici.settle.emptyList")}</EmptyState>
      )}

      {pending.length > 0 && (
        <>
          <SectionTitle>{t("baltici.settle.pendingSection")}</SectionTitle>
          {pending.map((p) => (
            <PaymentRow
              key={p.id}
              p={p}
              nameOf={nameOf}
              canDecide={gate.canEdit}
              onConfirm={() => actions.confirmPayment(p.id)}
              onReject={() => actions.rejectPayment(p.id)}
            />
          ))}
        </>
      )}

      {confirmed.length > 0 && (
        <>
          <SectionTitle>{t("baltici.settle.settledSection")}</SectionTitle>
          {confirmed.map((p) => (
            <PaymentRow key={p.id} p={p} nameOf={nameOf} canDecide={false} />
          ))}
        </>
      )}
    </div>
  );
}

/** A settle-up claim row. Pending: locked, waiting for the secret-word decision
 *  (the two buttons only show once unlocked). Confirmed: archived, grayed out. */
function PaymentRow({
  p,
  nameOf,
  canDecide,
  onConfirm,
  onReject,
}: {
  p: Payment;
  nameOf: (id: string) => string;
  canDecide: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
}) {
  const { t } = useTranslation();
  const confirmed = p.status === "confirmed";
  return (
    <Row style={{ alignItems: "flex-start", opacity: confirmed ? 0.45 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: `700 14px/1.2 ${mono}` }}>
          {nameOf(p.fromId)} → {nameOf(p.toId)}
        </div>
        <div style={{ font: `400 12px/1.4 ${mono}`, opacity: 0.7, marginTop: 2 }}>
          {t("baltici.settle.via", { method: p.method })}
        </div>
      </div>
      <div style={{ font: `700 14px/1 ${mono}`, whiteSpace: "nowrap" }}>{formatEuro(p.amountCents)}</div>
      {confirmed ? (
        <span style={badgeStyle}>{t("baltici.settle.settled")}</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <span style={badgeStyle}>🔒 {t("baltici.settle.pending")}</span>
          {canDecide && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={onConfirm}
                style={{ ...btnStyle, border: `1.5px solid ${PAPER}`, background: PAPER, color: INK }}
              >
                {t("baltici.settle.confirm")}
              </button>
              <button type="button" onClick={onReject} style={btnStyle}>
                {t("baltici.settle.reject")}
              </button>
            </div>
          )}
        </div>
      )}
    </Row>
  );
}

const btnStyle = {
  font: `700 11px/1 ${mono}`,
  border: "1.5px solid currentColor",
  background: "transparent",
  color: "inherit",
  padding: "6px 8px",
  cursor: "pointer",
} as const;

const badgeStyle = {
  font: `700 10px/1 ${mono}`,
  letterSpacing: ".08em",
  border: "1px solid currentColor",
  padding: "5px 7px",
  whiteSpace: "nowrap",
} as const;

export default BalticiSettledDebts;
