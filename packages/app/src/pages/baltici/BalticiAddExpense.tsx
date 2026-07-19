import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { SectionTitle } from "../../baltici/components/atoms";
import {
  Label,
  TextInput,
  AmountInput,
  DateInput,
  PersonSelect,
  SplitModeTabs,
  ParticipantsToggle,
  ExactSharesEditor,
} from "../../baltici/components/formControls";
import { parseAmountToCents } from "../../baltici/money";
import type { ExpenseDraft } from "../../baltici/validation";
import type { PersonId } from "../../baltici/model";

const mono = "'Space Mono', monospace";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Empty → 0 cents; invalid → null.
function parseShare(raw: string): number | null {
  if (raw.trim() === "") return 0;
  const r = parseAmountToCents(raw);
  return "cents" in r ? r.cents : null;
}

function BalticiAddExpense() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { state, actions } = useBaltici();

  const editing = editId ? state.expenses.find((e) => e.id === editId) : undefined;

  const [description, setDescription] = useState(editing?.description ?? "");
  const [amount, setAmount] = useState(
    editing ? (editing.amountCents / 100).toFixed(2).replace(".", ",") : ""
  );
  const [payerId, setPayerId] = useState<PersonId | "">(editing?.payerId ?? "");
  const [date, setDate] = useState(editing?.date ?? today());
  const [mode, setMode] = useState<"all" | "subset" | "exact">(() => {
    if (!editing) return "all";
    if (editing.splitMode === "exact") return "exact";
    return editing.participants.length === state.people.length ? "all" : "subset";
  });
  const [subset, setSubset] = useState<Set<PersonId>>(() => {
    if (editing && editing.splitMode === "equal") return new Set(editing.participants);
    return new Set(state.people.map((p) => p.id));
  });
  const [exactValues, setExactValues] = useState<Record<PersonId, string>>(() => {
    const out: Record<PersonId, string> = {};
    if (editing && editing.splitMode === "exact") {
      for (const [k, v] of Object.entries(editing.exactShares)) {
        out[k] = (v / 100).toFixed(2).replace(".", ",");
      }
    }
    return out;
  });
  const [error, setError] = useState<string | null>(null);

  const amountCents = useMemo(() => {
    const r = parseAmountToCents(amount);
    return "cents" in r ? r.cents : 0;
  }, [amount]);

  const exactSum = useMemo(() => {
    let s = 0;
    for (const p of state.people) {
      const c = parseShare(exactValues[p.id] ?? "");
      if (c && c > 0) s += c;
    }
    return s;
  }, [exactValues, state.people]);

  const remainder = amountCents - exactSum;

  const buildDraft = (): { draft?: ExpenseDraft; error?: string } => {
    const amt = parseAmountToCents(amount);
    if (!("cents" in amt)) return { error: t("baltici.expense.errAmount") };
    if (!payerId) return { error: t("baltici.expense.errPayer") };
    if (description.trim() === "") return { error: t("baltici.expense.errDescription") };

    const common = {
      description,
      amountCents: amt.cents,
      payerId,
      date,
    };

    if (mode === "exact") {
      const exactShares: Record<PersonId, number> = {};
      for (const p of state.people) {
        const c = parseShare(exactValues[p.id] ?? "");
        if (c === null) return { error: t("baltici.expense.errShares") };
        if (c > 0) exactShares[p.id] = c;
      }
      if (remainder !== 0) return { error: t("baltici.expense.errRemainder") };
      return { draft: { ...common, splitMode: "exact", exactShares } };
    }

    const participants =
      mode === "all" ? state.people.map((p) => p.id) : [...subset];
    if (participants.length === 0) return { error: t("baltici.expense.errParticipants") };
    return { draft: { ...common, splitMode: "equal", participants } };
  };

  const save = () => {
    setError(null);
    const { draft, error: err } = buildDraft();
    if (err || !draft) {
      setError(err ?? t("baltici.expense.errGeneric"));
      return;
    }
    const vErr = editing
      ? actions.updateExpense(editing.id, draft)
      : actions.addExpense(draft);
    if (vErr) {
      setError(t("baltici.expense.errGeneric"));
      return;
    }
    navigate("/baltici/expenses");
  };

  if (state.people.length === 0) {
    return <p style={{ font: `400 14px/1.5 ${mono}` }}>{t("baltici.expense.needPeople")}</p>;
  }

  const perHead =
    mode !== "exact" && amountCents > 0
      ? Math.floor(
          amountCents / (mode === "all" ? state.people.length : Math.max(subset.size, 1))
        )
      : 0;
  const headCount = mode === "all" ? state.people.length : subset.size;

  return (
    <div style={{ maxWidth: 520 }}>
      <SectionTitle>
        {editing ? t("baltici.expense.editTitle") : t("baltici.expense.newTitle")}
      </SectionTitle>

      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <Label text={t("baltici.expense.description")} />
          <TextInput value={description} onChange={setDescription} placeholder={t("baltici.expense.descriptionPlaceholder")} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label text={t("baltici.expense.amount")} />
            <AmountInput value={amount} onChange={setAmount} />
          </div>
          <div style={{ flex: 1 }}>
            <Label text={t("baltici.expense.payer")} />
            <PersonSelect people={state.people} value={payerId} onChange={setPayerId} />
          </div>
        </div>

        <div>
          <Label text={t("baltici.expense.date")} />
          <DateInput value={date} onChange={setDate} />
        </div>

        <div>
          <Label text={t("baltici.expense.split")} />
          <SplitModeTabs
            value={mode}
            labels={{
              all: t("baltici.expense.splitAll"),
              subset: t("baltici.expense.splitSubset"),
              exact: t("baltici.expense.splitExact"),
            }}
            onChange={(v) => {
              setMode(v);
              if (v === "subset" && subset.size === 0) {
                setSubset(new Set(state.people.map((p) => p.id)));
              }
            }}
          />
        </div>

        {mode === "subset" && (
          <ParticipantsToggle
            people={state.people}
            selected={subset}
            onToggle={(pid) => {
              setSubset((prev) => {
                const next = new Set(prev);
                if (next.has(pid)) next.delete(pid);
                else next.add(pid);
                return next;
              });
            }}
          />
        )}

        {mode === "exact" && (
          <ExactSharesEditor
            people={state.people}
            values={exactValues}
            onChange={(pid, v) => setExactValues((prev) => ({ ...prev, [pid]: v }))}
            remainderCents={remainder}
          />
        )}

        {mode !== "exact" && amountCents > 0 && headCount > 0 && (
          <div style={{ font: `400 13px/1.4 ${mono}`, opacity: 0.75 }}>
            {t("baltici.expense.perHead", {
              count: headCount,
              amount: (perHead / 100).toFixed(2).replace(".", ","),
            })}
          </div>
        )}

        {error && <div style={{ font: `700 13px/1.4 ${mono}`, color: "#a83232" }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={save}
            style={{ font: `700 13px/1 ${mono}`, border: "1.5px solid currentColor", background: "currentColor", color: "#ece7dd", padding: "12px 18px", cursor: "pointer" }}
          >
            {t("baltici.expense.save")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/baltici/expenses")}
            style={{ font: `400 13px/1 ${mono}`, border: "1.5px solid currentColor", background: "transparent", color: "inherit", padding: "12px 18px", cursor: "pointer" }}
          >
            {t("baltici.expense.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BalticiAddExpense;
