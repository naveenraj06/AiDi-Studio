import type { WidgetSuggestion, WidgetType } from "@/types";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Step2SuggestionProps {
  analyzing: boolean;
  suggestion: WidgetSuggestion | null;
  chosenType: WidgetType | null;
  onPickAlternative: (type: WidgetType) => void;
  onBack: () => void;
  onAccept: () => void;
}

function confidenceColor(confidence: number) {
  if (confidence >= 80) return "var(--color-brand-green)";
  if (confidence >= 60) return "var(--color-brand-amber)";
  return "var(--color-brand-red)";
}

export function Step2Suggestion({
  analyzing,
  suggestion,
  chosenType,
  onPickAlternative,
  onBack,
  onAccept,
}: Step2SuggestionProps) {
  if (analyzing || !suggestion) {
    return (
      <div className="flex flex-col items-center gap-3.5 py-[70px] text-[13px] text-ink-2">
        <div
          className="h-[34px] w-[34px] rounded-full border-[3px] border-border-strong"
          style={{ borderTopColor: "var(--color-brand-violet)", animation: "aidi-spin 0.8s linear infinite" }}
        />
        Fetching a live sample and analyzing schema…
      </div>
    );
  }

  const activeType = chosenType ?? suggestion.suggestedType;

  return (
    <div>
      <div className="mb-5 flex items-start gap-5">
        <Card className="flex-1">
          <div className="mb-1 flex items-center gap-2.5">
            <div className="text-[26px]">{TYPE_ICON[suggestion.suggestedType]}</div>
            <div>
              <div className="text-[15px] font-bold capitalize text-ink-1">{activeType} chart</div>
              <div className="text-[11px]" style={{ color: confidenceColor(suggestion.confidence) }}>
                {suggestion.confidence}% confidence
              </div>
            </div>
          </div>
          <div className="my-3 text-[12px] leading-[1.6] text-ink-2">{suggestion.reasoning}</div>
          <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.03em] text-ink-3">
            Field mapping
          </div>
          <div className="flex flex-col gap-1.5">
            {suggestion.mapping.map((m) => (
              <div
                key={m.field}
                className="flex justify-between rounded-sm border border-border-subtle bg-surface-sunken px-2.5 py-1.5 text-[12px]"
              >
                <span className="font-mono text-brand-cyan">{m.field}</span>
                <span className="text-ink-3">→</span>
                <span className="capitalize text-ink-2">{m.role}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="w-[200px] shrink-0">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.03em] text-ink-3">Alternatives</div>
          <div className="flex flex-col gap-1.5">
            {suggestion.alternatives.map((t) => {
              const active = activeType === t;
              return (
                <div
                  key={t}
                  onClick={() => onPickAlternative(t)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-[9px] text-[12px]"
                  style={{
                    background: active ? "var(--color-surface-selected)" : "var(--color-surface-sunken)",
                    borderColor: active ? "var(--color-brand-violet)" : "var(--color-border-subtle)",
                  }}
                >
                  <span>{TYPE_ICON[t]}</span>
                  <span className="capitalize">{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onAccept}>Accept &amp; continue →</Button>
      </div>
    </div>
  );
}
