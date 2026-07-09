import type { ApiResource, WidgetSuggestion, WidgetType } from "@/types";
import { ALL_WIDGET_TYPES } from "@/components/widgets/widgetTypeMeta";

// Deterministic stand-in for the AI Integration Spec (MASTER-SPEC.md §9):
// component-type suggestion + field mapping from a resource's shape. A real
// backend would call an LLM and fall back to this same rule-based logic on
// timeout/failure.
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

  if (/revenue|sales|dau|trend|csat|metrics/.test(name)) {
    type = "line";
    reasoning =
      "Detected a date-like field alongside a numeric field across multiple records — a time series line chart best shows the trend.";
  } else if (/tickets|region|channel|breakdown|sources|source/.test(name)) {
    type = "bar";
    reasoning =
      "Detected a categorical label field paired with a numeric field — a bar chart compares categories clearly.";
  } else if (/health|score|active|open/.test(name)) {
    type = "stat";
    reasoning =
      "Response is a single object with 2+ numeric fields and no time dimension — a stat card best highlights the headline number.";
  } else if (/mix|plan|install/.test(name)) {
    type = "donut";
    reasoning =
      "Detected a label + numeric field with 8 or fewer records — a donut chart shows composition well.";
  } else if (/shipping|sla|map|coverage/.test(name)) {
    type = "map";
    reasoning = "Detected geographic identifiers in the response fields — a map best represents regional coverage.";
  }

  const confidence = 68 + (h % 28);
  const alternatives = ALL_WIDGET_TYPES.filter((t) => t !== type)
    .sort(() => (h % 7) - 3)
    .slice(0, 3);
  const fieldPool = ["date", "value", "label", "category", "id", "region", "count", "status"];
  const roles = ["x-axis", "y-axis", "label", "value", "series"];
  const mapping = fieldPool.slice(0, 3).map((field, i) => ({
    field,
    role: roles[(h + i) % roles.length],
  }));

  return { suggestedType: type, confidence, reasoning, alternatives, mapping };
}
