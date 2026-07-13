import type { ShapedRow } from "@/lib/shapeWidgetData";

interface ListWidgetProps {
  rows: ShapedRow[];
  color?: string;
}

export function ListWidget({ rows, color = "#8b5cf6" }: ListWidgetProps) {
  if (rows.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-y-auto">
      {rows.map((row, i) => {
        const label = String(row.label ?? row["x-axis"] ?? Object.values(row)[0] ?? `Item ${i + 1}`);
        const value = row.value ?? row["y-axis"];
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-ink-1">
              {label}
            </span>
            {value !== undefined && <span className="shrink-0 text-[12px] font-semibold text-ink-2">{value}</span>}
          </div>
        );
      })}
    </div>
  );
}
