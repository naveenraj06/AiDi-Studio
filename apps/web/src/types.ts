export type WidgetType = "line" | "bar" | "stat" | "table" | "donut" | "map";

export type AuthType = "bearer" | "api_key" | "oauth" | "none";

export type Plan = "free" | "pro" | "team" | "enterprise";

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
  created_at: string;
  dashboards: number;
  widgets: number;
  resources: number;
}

export interface ApiResource {
  id: string;
  name: string;
  url: string;
  method: "GET";
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
}

export interface WidgetFineTune {
  title: string;
  color: string;
  showLegend: boolean;
  showPoints: boolean;
  refreshInterval: number;
}

export interface DashboardTile {
  id: string; // widget id
  colSpan: number;
  rowSpan: number;
  // Only populated by the public dashboard endpoint, which anonymous
  // viewers can't otherwise resolve via the authenticated widgets list.
  name?: string;
  type?: WidgetType;
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
