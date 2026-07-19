import type { Person, PersonId } from "../model";
import { formatEuro } from "../money";
import { PAPER, INK } from "./atoms";

const mono = "'Space Mono', monospace";

const controlStyle = {
  font: `400 14px/1 ${mono}`,
  padding: "9px 10px",
  border: "1.5px solid currentColor",
  background: "transparent",
  color: "inherit",
  width: "100%",
  boxSizing: "border-box" as const,
};

export function Label({ text }: { text: string }) {
  return (
    <span style={{ display: "block", font: `700 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6, opacity: 0.75 }}>
      {text}
    </span>
  );
}

export function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <input
      style={controlStyle}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  );
}

export function AmountInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      style={controlStyle}
      value={value}
      inputMode="decimal"
      placeholder="0,00"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      style={controlStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function PersonSelect({
  people,
  value,
  onChange,
}: {
  people: Person[];
  value: PersonId | "";
  onChange: (id: PersonId) => void;
}) {
  return (
    <select
      style={controlStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        —
      </option>
      {people.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function SplitModeTabs({
  value,
  labels,
  onChange,
}: {
  value: "all" | "subset" | "exact";
  labels: { all: string; subset: string; exact: string };
  onChange: (v: "all" | "subset" | "exact") => void;
}) {
  const items: { id: "all" | "subset" | "exact"; label: string }[] = [
    { id: "all", label: labels.all },
    { id: "subset", label: labels.subset },
    { id: "exact", label: labels.exact },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            style={{
              flex: 1,
              font: `${on ? 700 : 400} 12px/1 ${mono}`,
              padding: "8px 4px",
              border: "1.5px solid currentColor",
              background: on ? PAPER : "transparent",
              color: on ? INK : "inherit",
              cursor: "pointer",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function ParticipantsToggle({
  people,
  selected,
  onToggle,
}: {
  people: Person[];
  selected: ReadonlySet<PersonId>;
  onToggle: (id: PersonId) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}>
      {people.map((p) => {
        const on = selected.has(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              font: `${on ? 700 : 400} 13px/1 ${mono}`,
              padding: "8px 10px",
              border: "1.5px solid currentColor",
              background: on ? PAPER : "transparent",
              color: on ? INK : "inherit",
              opacity: on ? 1 : 0.6,
              cursor: "pointer",
            }}
          >
            <span>{p.name}</span>
            <span>{on ? "✓" : "○"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ExactSharesEditor({
  people,
  values,
  onChange,
  remainderCents,
}: {
  people: Person[];
  values: Record<PersonId, string>;
  onChange: (id: PersonId, v: string) => void;
  remainderCents: number;
}) {
  return (
    <div>
      <div style={{ display: "grid", gap: 6 }}>
        {people.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, font: `400 13px/1 ${mono}` }}>{p.name}</span>
            <input
              style={{ ...controlStyle, width: 110 }}
              inputMode="decimal"
              placeholder="0,00"
              value={values[p.id] ?? ""}
              onChange={(e) => onChange(p.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          font: `700 12px/1 ${mono}`,
          color: remainderCents === 0 ? "#3b7d3b" : "#a83232",
        }}
      >
        {remainderCents === 0
          ? "OK"
          : `${formatEuro(remainderCents)} da assegnare`}
      </div>
    </div>
  );
}
