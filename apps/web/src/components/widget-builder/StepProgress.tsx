const STEP_LABELS = ["Resource", "Component type", "Fine-tune", "Preview & save"];

export function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-[30px] flex gap-2">
      {STEP_LABELS.map((label, i) => {
        const isDone = i + 1 <= step;
        const isCurrent = i + 1 === step;
        return (
          <div key={label} className="flex-1">
            <div
              className="h-1 rounded-full"
              style={{ background: isDone ? "var(--color-brand-violet)" : "var(--color-border-strong)" }}
            />
            <div
              className="mt-[7px] text-[11px]"
              style={{
                color: isCurrent ? "var(--color-ink-1)" : "var(--color-ink-3)",
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
