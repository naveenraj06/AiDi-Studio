import type { WidgetTypeValue } from "./widgetTypes.js";

/**
 * Mapping roles each resource-bound widget type expects — the same role
 * vocabulary the frontend's shapeWidgetRows/ChartWidget/MetricWidget/etc.
 * read from (x-axis, y-axis, label, value, series, lat, lon, date). A
 * suggestion whose mapping doesn't cover these roles would render blank even
 * though it's syntactically valid JSON, so this doubles as the contract we
 * validate AI output against.
 */
export const ROLE_REQUIREMENTS: Record<WidgetTypeValue, string[]> = {
  line: ["x-axis", "y-axis"],
  area: ["x-axis", "y-axis"],
  bar: ["x-axis", "y-axis"],
  "stacked-bar": ["x-axis", "y-axis", "series"],
  donut: ["label", "value"],
  scatter: ["x-axis", "y-axis"],
  radar: ["x-axis", "y-axis"],
  treemap: ["label", "value"],
  funnel: ["label", "value"],
  stat: ["value"],
  gauge: ["value"],
  sparkline: ["y-axis"],
  progress: ["value"],
  table: [],
  list: [],
  "calendar-heatmap": ["date", "value"],
  map: ["label", "lat", "lon", "value"],
  text: [],
  image: [],
  divider: [],
  button: [],
  tabs: [],
  modal: [],
  container: [],
};

/** Roles a type can use if the data supports them, on top of its required roles —
 * never validated by satisfiesRoleRequirements, since a suggestion is still
 * perfectly usable without them. */
export const OPTIONAL_ROLES: Partial<Record<WidgetTypeValue, string[]>> = {
  stat: ["trend", "footer-value-1", "footer-value-2"],
};

export function roleRequirementsGuide(): string {
  return Object.entries(ROLE_REQUIREMENTS)
    .filter(([, roles]) => roles.length > 0)
    .map(([type, roles]) => {
      const optional = OPTIONAL_ROLES[type as WidgetTypeValue];
      return optional
        ? `- ${type}: ${roles.join(", ")} (optional, if the data has extra numeric fields: ${optional.join(", ")})`
        : `- ${type}: ${roles.join(", ")}`;
    })
    .join("\n");
}

/** True if a mapping's roles cover every role a type requires to render. */
export function satisfiesRoleRequirements(type: WidgetTypeValue, mapping: { role: string }[]): boolean {
  const required = ROLE_REQUIREMENTS[type] ?? [];
  if (required.length === 0) return true;
  const got = new Set(mapping.map((m) => m.role));
  return required.every((role) => got.has(role));
}
