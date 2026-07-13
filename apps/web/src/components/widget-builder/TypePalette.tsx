import type { WidgetType } from "@/types";
import { TYPE_ICON, TYPE_LABEL, WIDGET_GROUPS } from "@/components/widgets/widgetTypeMeta";

interface TypePaletteProps {
  activeType: WidgetType | null;
  onPick: (type: WidgetType) => void;
}

export function TypePalette({ activeType, onPick }: TypePaletteProps) {
  return (
    <div className="flex flex-col gap-5">
      {WIDGET_GROUPS.map((group) => (
        <div key={group.id}>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.03em] text-ink-3">{group.label}</div>
          <div className="mb-2 text-[11px] text-ink-3">{group.description}</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {group.types.map((t) => {
              const active = activeType === t;
              return (
                <div
                  key={t}
                  onClick={() => onPick(t)}
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors"
                  style={{
                    background: active ? "var(--color-surface-selected)" : "var(--color-surface-sunken)",
                    borderColor: active ? "var(--color-brand-violet)" : "var(--color-border-subtle)",
                  }}
                >
                  <span className="text-[18px]">{TYPE_ICON[t]}</span>
                  <span className="text-[11px] leading-tight text-ink-2">{TYPE_LABEL[t]}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
