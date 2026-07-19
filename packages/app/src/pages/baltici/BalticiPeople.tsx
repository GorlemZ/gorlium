import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBaltici } from "../../baltici/store";
import { PersonAvatar, Row, SectionTitle, EmptyState } from "../../baltici/components/atoms";
import { Label, TextInput } from "../../baltici/components/formControls";

const mono = "'Space Mono', monospace";

function BalticiPeople() {
  const { t } = useTranslation();
  const { state, actions } = useBaltici();
  const [newName, setNewName] = useState("");
  const [groupName, setGroupName] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  const nameValue = groupName ?? state.name;

  const add = () => {
    const n = newName.trim();
    if (!n) return;
    actions.addPerson(n);
    setNewName("");
  };

  return (
    <div>
      <SectionTitle>{t("baltici.people.groupName")}</SectionTitle>
      <div style={{ display: "flex", gap: 8 }}>
        <TextInput
          value={nameValue}
          onChange={setGroupName}
          onBlur={() => {
            if (groupName !== null && groupName !== state.name) {
              actions.setGroupName(groupName.trim());
            }
          }}
          placeholder={t("baltici.people.groupNamePlaceholder")}
        />
      </div>

      <SectionTitle>{t("baltici.people.title")}</SectionTitle>
      {state.people.length === 0 && <EmptyState>{t("baltici.people.empty")}</EmptyState>}
      {state.people.map((p) => {
        const canRemove = actions.canRemovePerson(p.id);
        return (
          <Row key={p.id}>
            <PersonAvatar person={p} />
            <input
              defaultValue={p.name}
              onBlur={(e) => {
                if (e.target.value.trim() === "") {
                  e.target.value = p.name; // don't allow clearing to empty
                  return;
                }
                actions.renamePerson(p.id, e.target.value);
              }}
              style={{ flex: 1, font: `400 14px/1 ${mono}`, border: "none", borderBottom: "1px solid transparent", background: "transparent", color: "inherit", padding: "4px 0" }}
            />
            <button
              type="button"
              onClick={() => {
                if (!actions.removePerson(p.id)) setBlocked(p.id);
              }}
              disabled={!canRemove}
              title={canRemove ? "" : t("baltici.people.removeBlocked")}
              style={{
                font: `700 11px/1 ${mono}`,
                border: "1.5px solid currentColor",
                background: "transparent",
                color: "inherit",
                padding: "6px 8px",
                cursor: canRemove ? "pointer" : "not-allowed",
                opacity: canRemove ? 1 : 0.4,
              }}
            >
              {t("baltici.people.remove")}
            </button>
          </Row>
        );
      })}

      {blocked && (
        <p style={{ font: `400 12px/1.5 ${mono}`, color: "#a83232" }}>
          {t("baltici.people.removeBlocked")}
        </p>
      )}

      <SectionTitle>{t("baltici.people.add")}</SectionTitle>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Label text={t("baltici.people.name")} />
          <TextInput
            value={newName}
            onChange={setNewName}
            placeholder={t("baltici.people.namePlaceholder")}
          />
        </div>
        <button
          type="button"
          onClick={add}
          style={{ font: `700 12px/1 ${mono}`, border: "1.5px solid currentColor", background: "currentColor", color: "#ece7dd", padding: "10px 14px", cursor: "pointer" }}
        >
          {t("baltici.people.addButton")}
        </button>
      </div>
    </div>
  );
}

export default BalticiPeople;
