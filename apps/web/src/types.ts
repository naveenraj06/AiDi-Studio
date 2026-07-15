export type ChartWidgetType =
  | "line"
  | "area"
  | "bar"
  | "stacked-bar"
  | "donut"
  | "scatter"
  | "radar"
  | "treemap"
  | "funnel";

export type MetricWidgetType = "stat" | "gauge" | "sparkline" | "progress";

export type DataWidgetType = "table" | "list" | "calendar-heatmap" | "map";

export type LayoutWidgetType = "text" | "image" | "divider" | "button" | "tabs" | "modal" | "container";

export type WidgetType = ChartWidgetType | MetricWidgetType | DataWidgetType | LayoutWidgetType;

export type WidgetCategory = "education" | "finance" | "sales" | "operations" | "generic" | "custom";

export type AuthType = "bearer" | "api_key" | "oauth" | "none";

export type Plan = "free" | "pro" | "org";

export type ProjectRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  display_name: string;
  email_verified: boolean;
}

export interface Session {
  user: User;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  plan: Plan;
  owner_id: string;
  org_id: string | null;
  created_at: string;
  dashboards: number;
  widgets: number;
  resources: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResource {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  auth_type: AuthType;
  status: "healthy" | "error";
  last_tested_at: string | null;
  last_test_latency_ms: number | null;
  imported_from: "postman" | "openapi" | "curl" | "manual";
  usedBy: number;
}

export interface Widget {
  id: string;
  name: string;
  type: WidgetType;
  is_template: boolean;
  category: WidgetCategory | null;
  resource: string | null;
  resource_id: string | null;
  mapping: FieldMapping[] | null;
  fine_tune: WidgetFineTune | null;
  updated_at: string;
}

export interface FieldMapping {
  field: string;
  role: string;
}

export interface WidgetSuggestion {
  suggestedType: WidgetType;
  confidence: number;
  reasoning: string;
  alternatives: WidgetType[];
  mapping: FieldMapping[];
  /** True when a real LLM produced this suggestion; false when the deterministic fallback ran (e.g. no AI provider configured). */
  usedAi: boolean;
}

/** A single sub-view embedded in a Tabs or Modal widget — its own mini widget config. */
export interface EmbeddedView {
  label: string;
  type: WidgetType;
  resourceId?: string | null;
  mapping?: FieldMapping[];
}

export interface WidgetFineTune {
  title: string;
  color: string;
  showLegend: boolean;
  showPoints: boolean;
  showTooltip: boolean;
  refreshInterval: number;
  // Card header shown above charts/tables/lists — not used by metric widgets,
  // which render their own compact header.
  subtitle?: string;
  // Metric widgets (gauge/progress): value range + status thresholds.
  unit?: string;
  min?: number;
  max?: number;
  thresholdWarn?: number;
  thresholdCritical?: number;
  // Stat card: caption after the trend arrow, and up to two footer sub-stats.
  // Trend/footer values themselves come from the "trend" / "footer-value-1" /
  // "footer-value-2" mapping roles — these are just their static captions.
  trendLabel?: string;
  footer1Label?: string;
  footer2Label?: string;
  // Table/list
  pageSize?: number;
  // Bar/stacked-bar: lay bars out horizontally (categories on the y-axis).
  horizontal?: boolean;
  // Line/area/bar/stacked-bar/scatter: gridlines and axis tick labels.
  showGrid?: boolean;
  showAxisLabels?: boolean;
  // Axis titles — default to the mapped field's name (humanized), overridable here.
  xAxisLabel?: string;
  yAxisLabel?: string;
  // Line/area: curved ("monotone") vs straight ("linear") segments.
  smoothLine?: boolean;
  // Donut: render with no center hole (a solid pie).
  asPie?: boolean;
  // Stat: "18.2k" vs "18,200".
  compactNumbers?: boolean;
  // Sparkline: show the headline number above the line.
  showValue?: boolean;
  // Table
  stripedRows?: boolean;
  // List: show each row's share of the total alongside its value.
  showPercentage?: boolean;
  // Layout primitives
  body?: string;
  align?: "left" | "center" | "right";
  imageUrl?: string;
  fit?: "cover" | "contain";
  buttonLabel?: string;
  buttonUrl?: string;
  openInNewTab?: boolean;
  dashed?: boolean;
  description?: string;
  // Tabs (multiple) / Modal (first entry only)
  views?: EmbeddedView[];
}

export interface DashboardTile {
  id: string; // widget id
  colSpan: number;
  rowSpan: number;
  // Only populated by the public dashboard endpoint, which anonymous
  // viewers can't otherwise resolve via the authenticated widgets list.
  name?: string;
  type?: WidgetType;
  resource?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  has_share_password: boolean;
  updated_at: string;
  widgetIds: string[];
  layout: DashboardTile[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
  invited_at: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed";
}

export interface PaymentCard {
  brand: string;
  last4: string;
  exp: string;
}

export interface Billing {
  plan: Plan;
  status: "active" | "past_due" | "canceled" | "trialing";
  seats: number;
  pricePerSeat: number;
  current_period_end: string | null;
  card: PaymentCard | null;
  invoices: Invoice[];
}

export type ToastKind = "success" | "error" | "info";
