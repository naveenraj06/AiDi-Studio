import type { WidgetFineTune, WidgetType } from "@/types";
import { TYPE_COLOR, TYPE_ICON, TYPE_LABEL } from "@/components/widgets/widgetTypeMeta";
import { WidgetCardHeader } from "@/components/widgets/WidgetCardHeader";
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
  line: { subtitle: "Weekly trend" },
  area: { subtitle: "Cumulative growth" },
  bar: { subtitle: "Category comparison" },
  "stacked-bar": { subtitle: "Segmented by region" },
  donut: { subtitle: "Composition breakdown" },
  scatter: { subtitle: "Correlation view" },
  radar: { subtitle: "Multi-axis comparison" },
  treemap: { subtitle: "Relative sizing" },
  funnel: { subtitle: "Stage drop-off" },
  gauge: { min: 0, max: 100, thresholdWarn: 60, thresholdCritical: 85, unit: "%" },
  progress: { min: 0, max: 100, thresholdWarn: 60, thresholdCritical: 85 },
  stat: { unit: "", trendLabel: "vs last period", footer1Label: "Fleet coverage", footer2Label: "Due in 30 days" },
  sparkline: { unit: "" },
  table: { pageSize: 4, subtitle: "Sample records" },
  list: { subtitle: "Ranked by value" },
  map: { subtitle: "Regional distribution" },
  "calendar-heatmap": { subtitle: "Daily activity" },
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
    showTooltip: true,
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
 * (marketing pages, the public component gallery). Shares WidgetCardHeader with the
 * dashboard builder and published dashboards, so a preview here looks exactly like the
 * real thing. */
export function WidgetSampleCard({ type, height = 180, className }: WidgetSampleCardProps) {
  const ft = sampleFineTune(type);
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <WidgetCardHeader icon={TYPE_ICON[type]} color={ft.color} title={ft.title} subtitle={ft.subtitle} />
      <div style={{ height }}>
        <WidgetRenderer type={type} ft={ft} />
      </div>
    </div>
  );
}
