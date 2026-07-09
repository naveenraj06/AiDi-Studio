import type {
  ApiResource,
  Billing,
  Dashboard,
  DashboardTile,
  Invoice,
  Project,
  ProjectMember,
  User,
  Widget,
} from "@prisma/client";

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.displayName,
    email_verified: user.emailVerified,
    totp_enabled: user.totpEnabled,
  };
}

export function serializeProject(
  project: Project & { _count: { dashboards: number; widgets: number; resources: number } },
) {
  return {
    id: project.id,
    name: project.name,
    icon: project.icon,
    color: project.color,
    plan: project.plan,
    owner_id: project.ownerId,
    created_at: project.createdAt.toISOString(),
    dashboards: project._count.dashboards,
    widgets: project._count.widgets,
    resources: project._count.resources,
  };
}

export function serializeResource(resource: ApiResource & { _count?: { widgets: number } }) {
  return {
    id: resource.id,
    name: resource.name,
    url: resource.url,
    method: resource.method,
    auth_type: resource.authType,
    status: resource.status,
    last_tested_at: resource.lastTestedAt ? resource.lastTestedAt.toISOString() : null,
    last_test_latency_ms: resource.lastTestLatencyMs,
    imported_from: resource.importedFrom,
    usedBy: resource._count?.widgets ?? 0,
  };
}

export function serializeWidget(widget: Widget & { resource: ApiResource | null }) {
  return {
    id: widget.id,
    name: widget.name,
    type: widget.type,
    is_template: widget.isTemplate,
    resource: widget.resource?.name ?? null,
    resource_id: widget.resourceId,
    mapping: widget.mapping ?? null,
    fine_tune: widget.fineTune ?? null,
    updated_at: widget.updatedAt.toISOString(),
  };
}

export function serializeDashboard(
  dashboard: Dashboard & { tiles: (DashboardTile & { widget: Widget })[] },
) {
  return {
    id: dashboard.id,
    name: dashboard.name,
    slug: dashboard.slug,
    status: dashboard.status,
    has_share_password: dashboard.sharePasswordHash != null,
    updated_at: dashboard.updatedAt.toISOString(),
    widgetIds: dashboard.tiles.sort((a, b) => a.position - b.position).map((t) => t.widgetId),
    layout: dashboard.tiles
      .sort((a, b) => a.position - b.position)
      .map((t) => ({ id: t.widgetId, colSpan: t.colSpan, rowSpan: t.rowSpan })),
  };
}

export function serializeTeamMember(member: ProjectMember) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    invited_at: member.invitedAt.toISOString(),
  };
}

export function serializeBilling(billing: Billing & { invoices: Invoice[] }) {
  return {
    plan: billing.plan,
    status: billing.status,
    seats: billing.seats,
    pricePerSeat: billing.pricePerSeat,
    current_period_end: billing.currentPeriodEnd ? billing.currentPeriodEnd.toISOString() : null,
    card:
      billing.cardBrand && billing.cardLast4 && billing.cardExp
        ? { brand: billing.cardBrand, last4: billing.cardLast4, exp: billing.cardExp }
        : null,
    invoices: billing.invoices.map((inv) => ({
      id: inv.id,
      date: inv.date.toISOString(),
      amount: inv.amount,
      status: inv.status,
    })),
  };
}
