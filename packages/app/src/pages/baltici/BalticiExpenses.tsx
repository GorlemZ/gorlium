import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { useEditGate } from "../../baltici/editGate";
import { UnlockBar } from "../../baltici/editGateUI";
import { Row, EmptyState, SectionTitle, PAPER, INK } from "../../baltici/components/atoms";
import { SettleUpModal } from "../../baltici/components/SettleUpModal";
import { formatEuro } from "../../baltici/money";
import { participantsOf, type Expense, type Payment, type Person } from "../../baltici/model";

const mono = "'Space Mono', monospace";

function splitSummary(e: Expense, people: Person[], allLabel: string): string {
  const parts = participantsOf(e);
  if (e.splitMode === "equal" && parts.length === people.length) return allLabel;
  if (e.splitMode === "exact") return `${parts.length}×`;
  return `${parts.length}`;
}

// Expenses and settle-up payments share one chronological list.
type ListItem =
  | { kind: "expense"; createdAt: number; expense: Expense }
  | { kind: "payment"; createdAt: number; payment: Payment };

function BalticiExpenses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, settlements, actions } = useBaltici();
  const gate = useEditGate();
  const [settleOpen, setSettleOpen] = useState(false);

  const nameOf = (id: string) => state.people.find((p) => p.id === id)?.name ?? "?";

  // who-owes lines still claimable: only one pending claim per from→to pair.
  const claimable = settlements.filter(
    (s) =>
      !state.payments.some(
        (p) => p.status === "pending" && p.fromId === s.fromId && p.toId === s.toId
      )
  );

  const items: ListItem[] = [
    ...state.expenses.map<ListItem>((e) => ({ kind: "expense", createdAt: e.createdAt, expense: e })),
    ...state.payments.map<ListItem>((p) => ({ kind: "payment", createdAt: p.createdAt, payment: p })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <SectionTitle>{t("baltici.expenses.title")}</SectionTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setSettleOpen(true)}
            style={{ font: `700 12px/1 ${mono}`, border: "1.5px solid currentColor", background: "transparent", color: "inherit", padding: "9px 12px", cursor: "pointer" }}
          >
            {t("baltici.settle.button")}
          </button>
          <Link
            to="/secret-baltici/expenses/new"
            style={{ font: `700 12px/1 ${mono}`, border: "1.5px solid currentColor", padding: "9px 12px", textDecoration: "none", color: "inherit" }}
          >
            {t("baltici.expenses.add")}
          </Link>
        </div>
      </div>

      <UnlockBar />

      {items.length === 0 && <EmptyState>{t("baltici.expenses.empty")}</EmptyState>}

      {items.map((item) =>
        item.kind === "expense" ? (
          <ExpenseRow
            key={item.expense.id}
            e={item.expense}
            people={state.people}
            nameOf={nameOf}
            canEdit={gate.canEdit}
            onEdit={() => navigate(`/secret-baltici/expenses/${item.expense.id}/edit`)}
            onRemove={() => actions.removeExpense(item.expense.id)}
          />
        ) : (
          <PaymentRow
            key={item.payment.id}
            p={item.payment}
            nameOf={nameOf}
            canDecide={gate.canEdit}
            onConfirm={() => actions.confirmPayment(item.payment.id)}
            onReject={() => actions.rejectPayment(item.payment.id)}
          />
        )
      )}

      {settleOpen && (
        <SettleUpModal
          people={state.people}
          available={claimable}
          onSubmit={(draft) => actions.addPayment(draft) === null}
          onClose={() => setSettleOpen(false)}
        />
      )}
    </div>
  );
}

function ExpenseRow({
  e,
  people,
  nameOf,
  canEdit,
  onEdit,
  onRemove,
}: {
  e: Expense;
  people: Person[];
  nameOf: (id: string) => string;
  canEdit: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Row style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: `700 14px/1.2 ${mono}` }}>{e.description}</div>
        <div style={{ font: `400 12px/1.4 ${mono}`, opacity: 0.7, marginTop: 2 }}>
          {t("baltici.expenses.paidBy", { name: nameOf(e.payerId) })} · {e.date} ·{" "}
          {splitSummary(e, people, t("baltici.expenses.all"))}
        </div>
      </div>
      <div style={{ font: `700 14px/1 ${mono}`, whiteSpace: "nowrap" }}>{formatEuro(e.amountCents)}</div>
      {canEdit && (
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={onEdit} style={btnStyle} aria-label={t("baltici.expenses.edit")}>
            {t("baltici.expenses.edit")}
          </button>
          <button type="button" onClick={onRemove} style={btnStyle} aria-label={t("baltici.expenses.remove")}>
            {t("baltici.expenses.remove")}
          </button>
        </div>
      )}
    </Row>
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
  onConfirm: () => void;
  onReject: () => void;
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

export default BalticiExpenses;
