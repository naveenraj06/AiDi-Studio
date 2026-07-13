import type { ApiResource, WidgetSuggestion, WidgetType } from "@/types";
import { CHART_TYPES, DATA_TYPES, METRIC_TYPES } from "@/components/widgets/widgetTypeMeta";

// Layout/UI primitives (text, button, tabs, ...) aren't resource-driven, so
// they're never a sensible "alternative" to a data-shape-based suggestion.
const SUGGESTABLE_TYPES: WidgetType[] = [...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES];

// Client-side last resort only: the real suggestion path is the backend's
// POST /resources/:id/suggest-widget (AI-backed, with its own data-aware
// heuristic fallback — see apps/api/src/lib/aiSuggest.ts). This purely
// name-keyword version only runs if that request itself can't be reached
// (e.g. the API is down), so the builder still produces something.
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function suggestFor(resource: ApiResource): WidgetSuggestion {
  const h = hashStr(resource.id + resource.name);
  const name = resource.name.toLowerCase();
  let type: WidgetType = "table";
  let reasoning =
    "Response is a flat object without a clear time series or category field, so a table gives the most faithful view of every returned field.";

  if (/revenue|sales|dau|trend|metrics/.test(name)) {
    type = "line";
    reasoning =
      "Detected a date-like field alongside a numeric field across multiple records — a time series line chart best shows the trend.";
  } else if (/traffic|usage|volume/.test(name)) {
    type = "area";
    reasoning = "Detected a cumulative time series — an area chart emphasizes the magnitude of the trend.";
  } else if (/tickets|region|channel|breakdown|sources|source/.test(name)) {
    type = "bar";
    reasoning =
      "Detected a categorical label field paired with a numeric field — a bar chart compares categories clearly.";
  } else if (/completion|progress|attendance/.test(name)) {
    type = "progress";
    reasoning = "Detected a single percentage-like field — a progress indicator best highlights how close it is to complete.";
  } else if (/health|risk|utilization/.test(name)) {
    type = "gauge";
    reasoning = "Detected a bounded score field — a gauge shows where it sits within its range at a glance.";
  } else if (/csat|score|active|open/.test(name)) {
    type = "stat";
    reasoning =
      "Response is a single object with 2+ numeric fields and no time dimension — a stat card best highlights the headline number.";
  } else if (/mix|plan|install/.test(name)) {
    type = "donut";
    reasoning =
      "Detected a label + numeric field with 8 or fewer records — a donut chart shows composition well.";
  } else if (/funnel|conversion|pipeline/.test(name)) {
    type = "funnel";
    reasoning = "Detected sequential stage counts — a funnel best shows drop-off between stages.";
  } else if (/activity|contributions|commits/.test(name)) {
    type = "calendar-heatmap";
    reasoning = "Detected daily activity counts — a calendar heatmap shows the pattern across days at a glance.";
  } else if (/shipping|sla|map|coverage|regions?\b/.test(name)) {
    type = "map";
    reasoning = "Detected geographic identifiers in the response fields — a map best represents regional coverage.";
  } else if (/feed|log|events?/.test(name)) {
    type = "list";
    reasoning = "Detected a stream of discrete records — a list reads better than a dense table for this shape.";
  }

  const confidence = 68 + (h % 28);
  const alternatives = SUGGESTABLE_TYPES.filter((t) => t !== type)
    .sort(() => (h % 7) - 3)
    .slice(0, 3);
  const fieldPool = ["date", "value", "label", "category", "id", "region", "count", "status"];
  const roles = ["x-axis", "y-axis", "label", "value", "series"];
  const mapping = fieldPool.slice(0, 3).map((field, i) => ({
    field,
    role: roles[(h + i) % roles.length],
  }));

  return { suggestedType: type, confidence, reasoning, alternatives, mapping, usedAi: false };
}
