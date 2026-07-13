// Single source of truth for the widget type catalog on the backend — keep in
// sync with apps/web/src/components/widgets/widgetTypeMeta.ts, which is the
// frontend's copy (icons/labels/grouping live there instead, since the API
// has no use for them).
export const CHART_TYPES = [
  "line",
  "area",
  "bar",
  "stacked-bar",
  "donut",
  "scatter",
  "radar",
  "treemap",
  "funnel",
] as const;

export const METRIC_TYPES = ["stat", "gauge", "sparkline", "progress"] as const;

export const DATA_TYPES = ["table", "list", "calendar-heatmap", "map"] as const;

export const LAYOUT_TYPES = ["text", "image", "divider", "button", "tabs", "modal", "container"] as const;

export const WIDGET_TYPES = [...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES, ...LAYOUT_TYPES] as const;

export type WidgetTypeValue = (typeof WIDGET_TYPES)[number];

// Layout/UI primitives aren't bound to an API resource, so the widget builder
// and the "use template" flow can skip resource selection for them.
export const RESOURCE_BOUND_TYPES = new Set<WidgetTypeValue>([...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES]);

export function requiresResource(type: WidgetTypeValue): boolean {
  return RESOURCE_BOUND_TYPES.has(type);
}

export const WIDGET_CATEGORIES = ["education", "finance", "sales", "operations", "generic", "custom"] as const;
export type WidgetCategory = (typeof WIDGET_CATEGORIES)[number];
