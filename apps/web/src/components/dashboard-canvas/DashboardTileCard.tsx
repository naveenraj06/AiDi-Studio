import type { WidgetType } from "@/types";
import type { LiveSource } from "@/lib/liveData";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface DashboardTileCardProps {
  name: string;
  type: WidgetType;
  color: string;
  colSpan: number;
  rowSpan: number;
  liveSource?: LiveSource;
  onDragStart: () => void;
  onDrop: () => void;
  onCycleSpan: () => void;
  onCycleRow: () => void;
  onRemove: () => void;
}

export function DashboardTileCard({
  name,
  type,
  color,
  colSpan,
  rowSpan,
  liveSource,
  onDragStart,
  onDrop,
  onCycleSpan,
  onCycleRow,
  onRemove,
}: DashboardTileCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex cursor-grab flex-col rounded-xl border border-border-default bg-bg-1 p-4"
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-ink-1">
          {name}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div
            onClick={onCycleSpan}
            title="Resize width"
            className="cursor-pointer rounded-xs px-1.5 py-0.5 text-[11px] text-ink-3 hover:bg-bg-3 hover:text-ink-1"
          >
            ↔
          </div>
          <div
            onClick={onCycleRow}
            title="Resize height"
            className="cursor-pointer rounded-xs px-1.5 py-0.5 text-[11px] text-ink-3 hover:bg-bg-3 hover:text-ink-1"
          >
            ↕
          </div>
          <div
            onClick={onRemove}
            title="Remove"
            className="cursor-pointer rounded-xs px-1.5 py-0.5 text-[12px] text-ink-3 hover:bg-brand-red-surface hover:text-brand-red"
          >
            ✕
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <WidgetRenderer type={type} color={color} showLegend showPoints liveSource={liveSource} />
      </div>
    </div>
  );
}
