import type { WidgetFineTune, WidgetType } from "@/types";
import { TYPE_COLOR, TYPE_LABEL } from "@/components/widgets/widgetTypeMeta";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { cn } from "@/lib/utils";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="400" height="200" fill="url(#g)"/></svg>`,
  );

/** Representative sample fine-tune per type, so unbound preview tiles (marketing pages, this
 * card) show something meaningful instead of "add X in the builder" empty states. */
const SAMPLE_FT_OVERRIDES: Partial<Record<WidgetType, Partial<WidgetFineTune>>> = {
  gauge: { min: 0, max: 100, thresholdWarn: 60, thresholdCritical: 85, unit: "%" },
  progress: { min: 0, max: 100, thresholdWarn: 60, thresholdCritical: 85 },
  stat: { unit: "" },
  sparkline: { unit: "" },
  table: { pageSize: 4 },
  text: { body: "Quarterly review notes go here — a static text block for context alongside your charts." },
  image: { imageUrl: PLACEHOLDER_IMAGE },
  divider: { title: "Q3 Metrics" },
  button: { buttonLabel: "View documentation", buttonUrl: "https://example.com" },
  container: { title: "Revenue overview", description: "All figures in USD, updated daily" },
  tabs: {
    views: [
      { label: "Revenue", type: "line" },
      { label: "Regions", type: "bar" },
      { label: "Table", type: "table" },
    ],
  },
  modal: { buttonLabel: "View full table", title: "Order details", views: [{ label: "detail", type: "table" }] },
};

export function sampleFineTune(type: WidgetType): WidgetFineTune {
  return {
    title: TYPE_LABEL[type],
    color: TYPE_COLOR[type],
    showLegend: true,
    showPoints: true,
    refreshInterval: 60,
    ...SAMPLE_FT_OVERRIDES[type],
  };
}

interface WidgetSampleCardProps {
  type: WidgetType;
  height?: number;
  className?: string;
}

/** A widget rendered with representative sample data instead of a live resource — used
 * anywhere the product wants to show what a component looks like without a real project
 * (marketing pages, the public component gallery). */
export function WidgetSampleCard({ type, height = 180, className }: WidgetSampleCardProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="text-[12px] font-semibold text-ink-1">{TYPE_LABEL[type]}</div>
      <div style={{ height }}>
        <WidgetRenderer type={type} ft={sampleFineTune(type)} />
      </div>
    </div>
  );
}
