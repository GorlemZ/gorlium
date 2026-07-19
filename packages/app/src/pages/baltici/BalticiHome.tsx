import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { PersonAvatar, Money, Row, EmptyState, SectionTitle } from "../../baltici/components/atoms";
import { formatEuro } from "../../baltici/money";

const mono = "'Space Mono', monospace";

function BalticiHome() {
  const { t } = useTranslation();
  const { isLoading, state, balances, totals } = useBaltici();

  if (isLoading) return <p style={{ font: `400 14px/1 ${mono}` }}>…</p>;

  const title = state.name.trim() || t("baltici.home.untitled");

  if (state.people.length === 0) {
    return (
      <div>
        <SectionTitle>{title}</SectionTitle>
        <EmptyState>
          {t("baltici.home.noPeople")}{" "}
          <Link to="/baltici/people" style={{ color: "inherit" }}>
            {t("baltici.tabs.people")}
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", margin: "8px 0 4px" }}>
        <Stat label={t("baltici.home.grandTotal")} value={formatEuro(totals.grand)} />
        <Stat label={t("baltici.home.expenses")} value={String(state.expenses.length)} />
      </div>

      <SectionTitle>{t("baltici.home.balances")}</SectionTitle>
      {state.people.map((p) => (
        <Row key={p.id}>
          <PersonAvatar person={p} />
          <span style={{ flex: 1, font: `400 14px/1 ${mono}` }}>{p.name}</span>
          <Money cents={balances[p.id] ?? 0} bold />
        </Row>
      ))}

      <p style={{ font: `400 12px/1.5 ${mono}`, opacity: 0.65, marginTop: 16 }}>
        {t("baltici.home.hint")}{" "}
        <Link to="/baltici/who-owes" style={{ color: "inherit" }}>
          {t("baltici.tabs.whoOwes")}
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ font: `700 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}>{label}</div>
      <div style={{ font: `700 22px/1.1 ${mono}`, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export default BalticiHome;
