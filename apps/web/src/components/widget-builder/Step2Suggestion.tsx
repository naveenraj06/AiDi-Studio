import * as React from "react";
import type { WidgetSuggestion, WidgetType } from "@/types";
import { TYPE_ICON, TYPE_LABEL } from "@/components/widgets/widgetTypeMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TypePalette } from "@/components/widget-builder/TypePalette";

interface Step2SuggestionProps {
  hasResource: boolean;
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
  hasResource,
  analyzing,
  suggestion,
  chosenType,
  onPickAlternative,
  onBack,
  onAccept,
}: Step2SuggestionProps) {
  const [browsingAll, setBrowsingAll] = React.useState(false);

  if (hasResource && (analyzing || !suggestion)) {
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

  // No resource attached (building a template or a static/layout widget) — go
  // straight to the full component palette instead of an AI suggestion.
  if (!hasResource) {
    return (
      <div>
        <div className="mb-1 text-[14px] font-semibold text-ink-1">Pick a component type</div>
        <div className="mb-[18px] text-[12px] text-ink-3">
          No resource attached — browse every available component and pick one to configure.
        </div>
        <TypePalette activeType={chosenType} onPick={onPickAlternative} />
        <div className="mt-[26px] flex justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <Button onClick={onAccept} disabled={!chosenType}>
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  const activeType = chosenType ?? suggestion!.suggestedType;

  return (
    <div>
      {browsingAll ? (
        <>
          <div className="mb-1 text-[14px] font-semibold text-ink-1">All component types</div>
          <div className="mb-[18px] text-[12px] text-ink-3">
            <span onClick={() => setBrowsingAll(false)} className="cursor-pointer font-semibold text-brand-violet-light underline">
              ← Back to AI suggestion
            </span>
          </div>
          <TypePalette activeType={activeType} onPick={onPickAlternative} />
        </>
      ) : (
        <div className="mb-5 flex items-start gap-5">
          <Card className="flex-1">
            <div className="mb-1 flex items-center gap-2.5">
              <div className="text-[26px]">{TYPE_ICON[suggestion!.suggestedType]}</div>
              <div>
                <div className="text-[15px] font-bold text-ink-1">{TYPE_LABEL[activeType]}</div>
                <div className="text-[11px]" style={{ color: confidenceColor(suggestion!.confidence) }}>
                  {suggestion!.confidence}% confidence
                </div>
              </div>
            </div>
            <div className="my-3 text-[12px] leading-[1.6] text-ink-2">{suggestion!.reasoning}</div>
            <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.03em] text-ink-3">Field mapping</div>
            <div className="flex flex-col gap-1.5">
              {suggestion!.mapping.map((m) => (
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
              {suggestion!.alternatives.map((t) => {
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
                    <span>{TYPE_LABEL[t]}</span>
                  </div>
                );
              })}
            </div>
            <div
              onClick={() => setBrowsingAll(true)}
              className="mt-2.5 cursor-pointer text-[11px] font-semibold text-brand-violet-light underline"
            >
              Browse all component types →
            </div>
          </div>
        </div>
      )}

      <div className="mt-2.5 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onAccept}>Accept &amp; continue →</Button>
      </div>
    </div>
  );
}
