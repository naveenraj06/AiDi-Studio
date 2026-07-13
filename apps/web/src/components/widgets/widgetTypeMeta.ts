import type { WidgetCategory, WidgetType } from "@/types";

export const WIDGET_CATEGORIES: WidgetCategory[] = ["education", "finance", "sales", "operations", "generic", "custom"];

export const CATEGORY_LABEL: Record<WidgetCategory, string> = {
  education: "Education",
  finance: "Finance",
  sales: "Sales",
  operations: "Operations",
  generic: "Generic",
  custom: "Custom",
};

export const CHART_TYPES: WidgetType[] = [
  "line",
  "area",
  "bar",
  "stacked-bar",
  "donut",
  "scatter",
  "radar",
  "treemap",
  "funnel",
];
export const METRIC_TYPES: WidgetType[] = ["stat", "gauge", "sparkline", "progress"];
export const DATA_TYPES: WidgetType[] = ["table", "list", "calendar-heatmap", "map"];
export const LAYOUT_TYPES: WidgetType[] = ["text", "image", "divider", "button", "tabs", "modal", "container"];

export const ALL_WIDGET_TYPES: WidgetType[] = [...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES, ...LAYOUT_TYPES];

export interface WidgetTypeGroup {
  id: "charts" | "metrics" | "data" | "layout";
  label: string;
  description: string;
  types: WidgetType[];
}

export const WIDGET_GROUPS: WidgetTypeGroup[] = [
  { id: "charts", label: "Charts", description: "Trends, comparisons, and composition", types: CHART_TYPES },
  {
    id: "metrics",
    label: "Metrics",
    description: "Single-value KPIs with trend indicators and footer stats",
    types: METRIC_TYPES,
  },
  { id: "data", label: "Data", description: "Tables, lists, maps, and calendars", types: DATA_TYPES },
  { id: "layout", label: "Layout", description: "Structure and static content — not resource-bound", types: LAYOUT_TYPES },
];

// Layout/UI primitives don't read from an API resource, so the widget
// builder can skip resource selection and live-data preview for them.
const RESOURCE_BOUND = new Set<WidgetType>([...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES]);
export function requiresResource(type: WidgetType): boolean {
  return RESOURCE_BOUND.has(type);
}

export const TYPE_LABEL: Record<WidgetType, string> = {
  line: "Line chart",
  area: "Area chart",
  bar: "Bar chart",
  "stacked-bar": "Stacked bar",
  donut: "Donut chart",
  scatter: "Scatter plot",
  radar: "Radar chart",
  treemap: "Treemap",
  funnel: "Funnel",
  stat: "Stat card",
  gauge: "Gauge",
  sparkline: "Sparkline",
  progress: "Progress",
  table: "Table",
  list: "List",
  "calendar-heatmap": "Calendar heatmap",
  map: "Map",
  text: "Text block",
  image: "Image",
  divider: "Divider",
  button: "Button",
  tabs: "Tabs",
  modal: "Modal",
  container: "Section header",
};

export const TYPE_ICON: Record<WidgetType, string> = {
  line: "📈",
  area: "📉",
  bar: "📊",
  "stacked-bar": "▤",
  donut: "◔",
  scatter: "⁘",
  radar: "◈",
  treemap: "▦",
  funnel: "▽",
  stat: "#",
  gauge: "◐",
  sparkline: "〰",
  progress: "▮",
  table: "☰",
  list: "≡",
  "calendar-heatmap": "▧",
  map: "🗺",
  text: "T",
  image: "🖼",
  divider: "—",
  button: "⬚",
  tabs: "⊟",
  modal: "⧉",
  container: "▭",
};

export const TYPE_COLOR: Record<WidgetType, string> = {
  line: "#8b5cf6",
  area: "#a78bfa",
  bar: "#22d3ee",
  "stacked-bar": "#06b6d4",
  donut: "#f87171",
  scatter: "#fb923c",
  radar: "#c084fc",
  treemap: "#34d399",
  funnel: "#f472b6",
  stat: "#34d399",
  gauge: "#fbbf24",
  sparkline: "#8b5cf6",
  progress: "#22d3ee",
  table: "#fbbf24",
  list: "#a3a3a3",
  "calendar-heatmap": "#34d399",
  map: "#22d3ee",
  text: "#a3a3a3",
  image: "#a3a3a3",
  divider: "#a3a3a3",
  button: "#8b5cf6",
  tabs: "#8b5cf6",
  modal: "#8b5cf6",
  container: "#a3a3a3",
};
