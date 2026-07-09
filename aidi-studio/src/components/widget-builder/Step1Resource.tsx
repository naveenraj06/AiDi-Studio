import type { ApiResource } from "@/types";
import { Button } from "@/components/ui/button";

interface Step1ResourceProps {
  resources: ApiResource[];
  selectedResourceId: string | null;
  onSelect: (resource: ApiResource) => void;
  onNext: () => void;
}

export function Step1Resource({ resources, selectedResourceId, onSelect, onNext }: Step1ResourceProps) {
  const hasSelection = !!selectedResourceId;

  return (
    <div>
      <div className="mb-1 text-[14px] font-semibold text-ink-1">Pick an API resource</div>
      <div className="mb-[18px] text-[12px] text-ink-3">
        AiDi will analyze a live sample response to suggest a component and field mapping.
      </div>

      <div className="flex flex-col gap-2">
        {resources.map((r) => {
          const selected = selectedResourceId === r.id;
          return (
            <div
              key={r.id}
              onClick={() => onSelect(r)}
              className="flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3.5 transition-colors"
              style={{
                background: selected ? "var(--color-surface-selected)" : "var(--color-bg-1)",
                borderColor: selected ? "var(--color-brand-violet)" : "var(--color-border-default)",
              }}
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: r.status === "healthy" ? "var(--color-brand-green)" : "var(--color-brand-red)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink-1">{r.name}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-ink-3">
                  {r.url}
                </div>
              </div>
              <div className="text-[11px] capitalize text-ink-3">{r.auth_type}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-[26px] flex justify-end">
        <Button
          onClick={onNext}
          style={{
            background: hasSelection ? "var(--color-brand-violet)" : "var(--color-border-track)",
            cursor: hasSelection ? "pointer" : "default",
          }}
        >
          Analyze &amp; continue →
        </Button>
      </div>
    </div>
  );
}
