import type { ShapedRow } from "@/lib/shapeWidgetData";

const PALETTE = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#c084fc", "#fb923c"];

interface ListWidgetProps {
  rows: ShapedRow[];
  color?: string;
  showPercentage?: boolean;
}

export function ListWidget({ rows, color = "#8b5cf6", showPercentage = true }: ListWidgetProps) {
  if (rows.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  const numericValues = rows.map((row) => {
    const v = row.value ?? row["y-axis"];
    return typeof v === "number" ? v : undefined;
  });
  const total = numericValues.reduce((sum: number, v) => sum + (v ?? 0), 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {rows.map((row, i) => {
        const label = String(row.label ?? row["x-axis"] ?? Object.values(row)[0] ?? `Item ${i + 1}`);
        const value = row.value ?? row["y-axis"];
        const numericValue = numericValues[i];
        const pct =
          showPercentage && numericValue !== undefined && total > 0
            ? Math.round((numericValue / total) * 100)
            : undefined;
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 border-b border-border-subtle py-2 last:border-b-0"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: i === 0 ? color : PALETTE[i % PALETTE.length] }}
            />
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-ink-1">
              {label}
            </span>
            {value !== undefined && (
              <div className="shrink-0 text-right">
                <div className="text-[13px] font-semibold text-ink-1">{value}</div>
                {pct !== undefined && <div className="text-[11px] text-ink-3">{pct}%</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
