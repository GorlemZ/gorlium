import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { Row, EmptyState, SectionTitle } from "../../baltici/components/atoms";
import { formatEuro } from "../../baltici/money";
import { participantsOf, type Expense, type Person } from "../../baltici/model";

const mono = "'Space Mono', monospace";

function splitSummary(e: Expense, people: Person[], allLabel: string): string {
  const parts = participantsOf(e);
  if (e.splitMode === "equal" && parts.length === people.length) return allLabel;
  if (e.splitMode === "exact") return `${parts.length}×`;
  return `${parts.length}`;
}

function BalticiExpenses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, actions } = useBaltici();

  const nameOf = (id: string) => state.people.find((p) => p.id === id)?.name ?? "?";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>{t("baltici.expenses.title")}</SectionTitle>
        <Link
          to="/baltici/expenses/new"
          style={{ font: `700 12px/1 ${mono}`, border: "1.5px solid currentColor", padding: "9px 12px", textDecoration: "none", color: "inherit" }}
        >
          {t("baltici.expenses.add")}
        </Link>
      </div>

      {state.expenses.length === 0 && <EmptyState>{t("baltici.expenses.empty")}</EmptyState>}

      {state.expenses.map((e) => (
        <Row key={e.id} style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: `700 14px/1.2 ${mono}` }}>{e.description}</div>
            <div style={{ font: `400 12px/1.4 ${mono}`, opacity: 0.7, marginTop: 2 }}>
              {t("baltici.expenses.paidBy", { name: nameOf(e.payerId) })} · {e.date} ·{" "}
              {splitSummary(e, state.people, t("baltici.expenses.all"))}
            </div>
          </div>
          <div style={{ font: `700 14px/1 ${mono}`, whiteSpace: "nowrap" }}>{formatEuro(e.amountCents)}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => navigate(`/baltici/expenses/${e.id}/edit`)}
              style={btnStyle}
              aria-label={t("baltici.expenses.edit")}
            >
              {t("baltici.expenses.edit")}
            </button>
            <button
              type="button"
              onClick={() => actions.removeExpense(e.id)}
              style={btnStyle}
              aria-label={t("baltici.expenses.remove")}
            >
              {t("baltici.expenses.remove")}
            </button>
          </div>
        </Row>
      ))}
    </div>
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

export default BalticiExpenses;
