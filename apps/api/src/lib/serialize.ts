interface CountRow {
  count: number;
}

export interface ProjectRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  plan: string;
  owner_id: string;
  created_at: string;
  dashboards?: CountRow[];
  widgets?: CountRow[];
  resources?: CountRow[];
}

export function serializeProject(p: ProjectRow) {
  return {
    id: p.id,
    name: p.name,
    icon: p.icon,
    color: p.color,
    plan: p.plan,
    owner_id: p.owner_id,
    created_at: p.created_at,
    dashboards: p.dashboards?.[0]?.count ?? 0,
    widgets: p.widgets?.[0]?.count ?? 0,
    resources: p.resources?.[0]?.count ?? 0,
  };
}

export interface ResourceRow {
  id: string;
  name: string;
  url: string;
  method: string;
  auth_type: string;
  status: string;
  last_tested_at: string | null;
  last_test_latency_ms: number | null;
  imported_from: string;
  widgets?: CountRow[];
}

export function serializeResource(r: ResourceRow) {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    method: r.method,
    auth_type: r.auth_type,
    status: r.status,
    last_tested_at: r.last_tested_at,
    last_test_latency_ms: r.last_test_latency_ms,
    imported_from: r.imported_from,
    usedBy: r.widgets?.[0]?.count ?? 0,
  };
}

export interface WidgetRow {
  id: string;
  name: string;
  type: string;
  is_template: boolean;
  category: string | null;
  resource_id: string | null;
  resource: { id: string; name: string } | null;
  mapping: unknown;
  fine_tune: unknown;
  updated_at: string;
}

export function serializeWidget(w: WidgetRow) {
  return {
    id: w.id,
    name: w.name,
    type: w.type,
    is_template: w.is_template,
    category: w.category ?? null,
    resource: w.resource?.name ?? null,
    resource_id: w.resource_id,
    mapping: w.mapping ?? null,
    fine_tune: w.fine_tune ?? null,
    updated_at: w.updated_at,
  };
}

export interface DashboardTileRow {
  widget_id: string;
  position: number;
  col_span: number;
  row_span: number;
  widget?: { name: string; type: string; resource?: { name: string } | null } | null;
}

export interface DashboardRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  share_password_hash: string | null;
  updated_at: string;
  dashboard_tiles?: DashboardTileRow[];
}

export function serializeDashboard(d: DashboardRow) {
  const tiles = [...(d.dashboard_tiles ?? [])].sort((a, b) => a.position - b.position);
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    status: d.status,
    has_share_password: d.share_password_hash != null,
    updated_at: d.updated_at,
    widgetIds: tiles.map((t) => t.widget_id),
    layout: tiles.map((t) => ({
      id: t.widget_id,
      colSpan: t.col_span,
      rowSpan: t.row_span,
      ...(t.widget
        ? { name: t.widget.name, type: t.widget.type, resource: t.widget.resource?.name }
        : {}),
    })),
  };
}

export interface TeamMemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  invited_at: string;
}

export function serializeTeamMember(m: TeamMemberRow) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    invited_at: m.invited_at,
  };
}

export interface InvoiceRow {
  id: string;
  date: string;
  amount: number;
  status: string;
}

export interface BillingRow {
  plan: string;
  status: string;
  seats: number;
  price_per_seat: number;
  current_period_end: string | null;
  card_brand: string | null;
  card_last4: string | null;
  card_exp: string | null;
  invoices?: InvoiceRow[];
}

export function serializeBilling(b: BillingRow) {
  return {
    plan: b.plan,
    status: b.status,
    seats: b.seats,
    pricePerSeat: b.price_per_seat,
    current_period_end: b.current_period_end,
    card:
      b.card_brand && b.card_last4 && b.card_exp
        ? { brand: b.card_brand, last4: b.card_last4, exp: b.card_exp }
        : null,
    invoices: (b.invoices ?? []).map((inv) => ({
      id: inv.id,
      date: inv.date,
      amount: inv.amount,
      status: inv.status,
    })),
  };
}
