import type { ShapedRow } from "@/lib/shapeWidgetData";

interface CalendarHeatmapWidgetProps {
  rows: ShapedRow[];
  color?: string;
}

interface Cell {
  date: string;
  value: number;
}

function intensity(value: number, max: number) {
  return max <= 0 ? 0 : Math.min(1, value / max);
}

export function CalendarHeatmapWidget({ rows, color = "#34d399" }: CalendarHeatmapWidgetProps) {
  const cells: Cell[] = rows
    .map((r) => ({ date: String(r.date ?? r["x-axis"] ?? ""), value: Number(r.value ?? r["y-axis"] ?? 0) }))
    .filter((c) => c.date);

  if (cells.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  const max = Math.max(1, ...cells.map((c) => c.value));
  const leadingBlank = new Date(cells[0].date).getDay();
  const padded: (Cell | null)[] = [...new Array(leadingBlank).fill(null), ...cells];
  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <div className="flex h-full items-center justify-center overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, di) => (
              <div
                key={di}
                title={cell ? `${cell.date}: ${cell.value}` : undefined}
                className="h-[11px] w-[11px] rounded-[2px]"
                style={{
                  background: cell ? color : "transparent",
                  opacity: cell ? 0.15 + intensity(cell.value, max) * 0.85 : 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
