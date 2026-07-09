import type { WidgetType } from "@/types";

export const TYPE_ICON: Record<WidgetType, string> = {
  line: "📈",
  bar: "📊",
  stat: "#",
  table: "▤",
  donut: "◔",
  map: "🗺",
};

export const ALL_WIDGET_TYPES: WidgetType[] = ["line", "bar", "stat", "table", "donut", "map"];

export const TYPE_COLOR: Record<WidgetType, string> = {
  line: "#8b5cf6",
  bar: "#22d3ee",
  stat: "#34d399",
  table: "#fbbf24",
  donut: "#f87171",
  map: "#22d3ee",
};
