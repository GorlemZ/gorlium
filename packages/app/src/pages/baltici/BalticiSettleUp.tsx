import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { Row, EmptyState, SectionTitle, PersonAvatar } from "../../baltici/components/atoms";
import { SettleUpModal } from "../../baltici/components/SettleUpModal";
import { formatEuro } from "../../baltici/money";
import type { Person } from "../../baltici/model";
import type { Settlement } from "../../baltici/calc";

const mono = "'Space Mono', monospace";

function BalticiSettleUp() {
  const { t } = useTranslation();
  const { state, settlements, actions } = useBaltici();
  // The line being claimed — a snapshot taken at click time, so the amount is
  // frozen even if expenses change while the modal is open.
  const [claiming, setClaiming] = useState<Settlement | null>(null);

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
        // A claim is waiting for the secret-word decision on this pair — the
        // debt stays counted (and shown) until it's confirmed; no second claim.
        const pending = state.payments.some(
          (p) => p.status === "pending" && p.fromId === s.fromId && p.toId === s.toId
        );
        return (
          <Row key={i} style={{ flexWrap: "wrap" }}>
            <PersonAvatar person={from} size={26} />
            <span style={{ font: `400 14px/1 ${mono}` }}>{from.name}</span>
            <span style={{ opacity: 0.6 }}>→</span>
            <PersonAvatar person={to} size={26} />
            <span style={{ flex: 1, font: `400 14px/1 ${mono}` }}>{to.name}</span>
            <span style={{ font: `700 14px/1 ${mono}` }}>{formatEuro(s.amountCents)}</span>
            {pending ? (
              <span style={{ font: `700 10px/1 ${mono}`, letterSpacing: ".08em", border: "1px solid currentColor", padding: "5px 7px", opacity: 0.75, whiteSpace: "nowrap" }}>
                🔒 {t("baltici.settle.pending")}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setClaiming(s)}
                style={{ font: `700 11px/1 ${mono}`, border: "1.5px solid currentColor", background: "transparent", color: "inherit", padding: "6px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {t("baltici.settle.button")}
              </button>
            )}
          </Row>
        );
      })}

      <p style={{ font: `400 12px/1.5 ${mono}`, opacity: 0.65, marginTop: 16 }}>
        {t("baltici.whoOwes.hint")}
      </p>

      {claiming && (
        <SettleUpModal
          people={state.people}
          line={claiming}
          onSubmit={(draft) => actions.addPayment(draft) === null}
          onClose={() => setClaiming(null)}
        />
      )}
    </div>
  );
}

export default BalticiSettleUp;
