import type { WidgetType } from "@/types";
import type { ShapedRow } from "@/lib/shapeWidgetData";

// Placeholder rows shown in the builder preview and on dashboards until a
// widget has a resource attached (or while a live fetch is loading) — shaped
// the same way real resource data would be after `shapeWidgetRows`.

const XY_SAMPLE: ShapedRow[] = [
  { "x-axis": "Mon", "y-axis": 140 },
  { "x-axis": "Tue", "y-axis": 110 },
  { "x-axis": "Wed", "y-axis": 120 },
  { "x-axis": "Thu", "y-axis": 70 },
  { "x-axis": "Fri", "y-axis": 90 },
  { "x-axis": "Sat", "y-axis": 130 },
];

const STACKED_SAMPLE: ShapedRow[] = [
  { "x-axis": "Mon", "y-axis": 80, series: "US" },
  { "x-axis": "Mon", "y-axis": 60, series: "EU" },
  { "x-axis": "Tue", "y-axis": 95, series: "US" },
  { "x-axis": "Tue", "y-axis": 70, series: "EU" },
  { "x-axis": "Wed", "y-axis": 60, series: "US" },
  { "x-axis": "Wed", "y-axis": 55, series: "EU" },
  { "x-axis": "Thu", "y-axis": 90, series: "US" },
  { "x-axis": "Thu", "y-axis": 40, series: "EU" },
];

const COMPOSITION_SAMPLE: ShapedRow[] = [
  { label: "Segment A", value: 45 },
  { label: "Segment B", value: 30 },
  { label: "Segment C", value: 25 },
];

const TABLE_SAMPLE: ShapedRow[] = [
  { label: "US-West", value: 1204, region: "US-West", amount: "$18.2k" },
  { label: "EU-Central", value: 882, region: "EU-Central", amount: "$12.9k" },
  { label: "APAC", value: 604, region: "APAC", amount: "$8.1k" },
  { label: "US-East", value: 441, region: "US-East", amount: "$6.4k" },
];

const MAP_SAMPLE: ShapedRow[] = [
  { label: "US-West", lat: 37, lon: -122, value: 1204 },
  { label: "EU-Central", lat: 50, lon: 10, value: 882 },
  { label: "APAC", lat: 1, lon: 104, value: 604 },
  { label: "US-East", lat: 40, lon: -74, value: 441 },
];

function generateHeatmapSample(): ShapedRow[] {
  const rows: ShapedRow[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const seed = (d.getDate() * 7 + d.getMonth() * 3) % 5;
    rows.push({ date: d.toISOString().slice(0, 10), value: seed });
  }
  return rows;
}

const METRIC_SAMPLE: ShapedRow[] = [
  { value: 18200, trend: 8.2, "footer-value-1": "96%", "footer-value-2": 14 },
];
const RANGE_METRIC_SAMPLE: ShapedRow[] = [{ value: 68 }];

export function sampleRowsFor(type: WidgetType): ShapedRow[] {
  switch (type) {
    case "line":
    case "area":
    case "bar":
    case "scatter":
    case "radar":
      return XY_SAMPLE;
    case "stacked-bar":
      return STACKED_SAMPLE;
    case "donut":
    case "treemap":
    case "funnel":
      return COMPOSITION_SAMPLE;
    case "stat":
      return METRIC_SAMPLE;
    case "gauge":
    case "progress":
      return RANGE_METRIC_SAMPLE;
    case "sparkline":
      return XY_SAMPLE;
    case "table":
    case "list":
      return TABLE_SAMPLE;
    case "calendar-heatmap":
      return generateHeatmapSample();
    case "map":
      return MAP_SAMPLE;
    default:
      return [];
  }
}
