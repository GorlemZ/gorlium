import { ReactNode, useState } from "react";

export interface TabsProps {
  tabs: { label: ReactNode; content: ReactNode }[];
  defaultIndex?: number;
  index?: number;
  onChange?: (i: number) => void;
}

export function Tabs({ tabs, defaultIndex = 0, index, onChange }: TabsProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const active = index ?? internal;

  const select = (i: number) => {
    if (index === undefined) setInternal(i);
    onChange?.(i);
  };

  return (
    <div className="g-tabs">
      <div className="g-tabs__list" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={
              "g-tabs__tab" + (i === active ? " g-tabs__tab--active" : "")
            }
            onClick={() => select(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="g-tabs__panel" role="tabpanel">
        {tabs[active]?.content}
      </div>
    </div>
  );
}

export default Tabs;
