import type { FieldMapping, WidgetFineTune, WidgetType } from "@/types";
import type { LiveSource } from "@/lib/liveData";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import { WidgetCardHeader } from "@/components/widgets/WidgetCardHeader";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface DashboardTileCardProps {
  name: string;
  type: WidgetType;
  projectId: string;
  resourceId: string | null;
  mapping: FieldMapping[] | null;
  ft: Partial<WidgetFineTune>;
  colSpan: number;
  rowSpan: number;
  liveSource?: LiveSource;
  onDragStart: () => void;
  onDrop: () => void;
  onCycleSpan: () => void;
  onCycleRow: () => void;
  onRemove: () => void;
  onFilter: () => void;
}

export function DashboardTileCard({
  name,
  type,
  projectId,
  resourceId,
  mapping,
  ft,
  colSpan,
  rowSpan,
  liveSource,
  onDragStart,
  onDrop,
  onCycleSpan,
  onCycleRow,
  onRemove,
  onFilter,
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
      <WidgetCardHeader
        icon={TYPE_ICON[type]}
        color={ft.color ?? "#8b5cf6"}
        title={name}
        subtitle={ft.subtitle}
        actions={
          <>
            <div
              onClick={onFilter}
              title="Filter this widget"
              className="cursor-pointer rounded-xs px-1.5 py-0.5 text-[11px] text-ink-3 hover:bg-bg-3 hover:text-ink-1"
            >
              ⏷
            </div>
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
          </>
        }
      />
      <div className="min-h-0 flex-1">
        <WidgetRenderer
          type={type}
          projectId={projectId}
          resourceId={resourceId}
          mapping={mapping}
          ft={ft}
          liveSource={liveSource}
        />
      </div>
    </div>
  );
}
