import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { Row, EmptyState, SectionTitle, PersonAvatar } from "../../baltici/components/atoms";
import { formatEuro } from "../../baltici/money";
import type { Person } from "../../baltici/model";

const mono = "'Space Mono', monospace";

function BalticiSettleUp() {
  const { t } = useTranslation();
  const { state, settlements } = useBaltici();

  const byId = (id: string): Person | undefined => state.people.find((p) => p.id === id);

  return (
    <div>
      <SectionTitle>{t("baltici.whoOwes.title")}</SectionTitle>

      {state.people.length === 0 && <EmptyState>{t("baltici.whoOwes.empty")}</EmptyState>}
      {state.people.length > 0 && settlements.length === 0 && (
        <EmptyState>{t("baltici.whoOwes.allEven")}</EmptyState>
      )}

      {settlements.map((s, i) => {
        const from = byId(s.fromId);
        const to = byId(s.toId);
        if (!from || !to) return null;
        return (
          <Row key={i}>
            <PersonAvatar person={from} size={26} />
            <span style={{ font: `400 14px/1 ${mono}` }}>{from.name}</span>
            <span style={{ opacity: 0.6 }}>→</span>
            <PersonAvatar person={to} size={26} />
            <span style={{ flex: 1, font: `400 14px/1 ${mono}` }}>{to.name}</span>
            <span style={{ font: `700 14px/1 ${mono}` }}>{formatEuro(s.amountCents)}</span>
          </Row>
        );
      })}

      <p style={{ font: `400 12px/1.5 ${mono}`, opacity: 0.65, marginTop: 16 }}>
        {t("baltici.whoOwes.hint")}
      </p>
    </div>
  );
}

export default BalticiSettleUp;
