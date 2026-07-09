import type {
  ApiResource,
  Billing,
  Dashboard,
  Project,
  TeamMember,
  User,
  Widget,
} from "@/types";

// Sample dataset ported from the design bundle's seedData() (AiDi Studio.dc.html)
// so every screen has realistic, cross-referenced content out of the box.

export const users: Record<string, User> = {
  u1: {
    id: "u1",
    email: "jordan@aidistudio.dev",
    display_name: "Jordan Reyes",
    email_verified: true,
    totp_enabled: false,
  },
};

export const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Northwind Analytics",
    icon: "📊",
    color: "#8b5cf6",
    plan: "pro",
    owner_id: "u1",
    created_at: "2026-04-02",
    dashboards: 4,
    widgets: 11,
    resources: 5,
  },
  {
    id: "p2",
    name: "Launchpad Metrics",
    icon: "🚀",
    color: "#22d3ee",
    plan: "free",
    owner_id: "u1",
    created_at: "2026-05-14",
    dashboards: 2,
    widgets: 4,
    resources: 2,
  },
  {
    id: "p3",
    name: "Support Ops",
    icon: "🎧",
    color: "#34d399",
    plan: "team",
    owner_id: "u1",
    created_at: "2026-01-20",
    dashboards: 6,
    widgets: 18,
    resources: 7,
  },
];

export const initialResourcesByProject: Record<string, ApiResource[]> = {
  p1: [
    { id: "r1", name: "Stripe Revenue", url: "https://api.stripe.com/v1/charges", method: "GET", auth_type: "bearer", status: "healthy", last_tested_at: "2026-07-08T10:00:00Z", last_test_latency_ms: 212, imported_from: "manual", usedBy: 3 },
    { id: "r2", name: "Postgres Metrics Export", url: "https://internal.northwind.dev/api/metrics", method: "GET", auth_type: "api_key", status: "healthy", last_tested_at: "2026-07-08T09:12:00Z", last_test_latency_ms: 88, imported_from: "postman", usedBy: 4 },
    { id: "r3", name: "Customer Health Score", url: "https://api.northwind.dev/v2/health-scores", method: "GET", auth_type: "oauth", status: "error", last_tested_at: "2026-07-07T16:40:00Z", last_test_latency_ms: null, imported_from: "openapi", usedBy: 2 },
    { id: "r4", name: "Shipping SLA Feed", url: "https://logistics.northwind.dev/sla", method: "GET", auth_type: "none", status: "healthy", last_tested_at: "2026-07-06T08:00:00Z", last_test_latency_ms: 340, imported_from: "curl", usedBy: 1 },
    { id: "r5", name: "NPS Survey Results", url: "https://survey.northwind.dev/api/nps", method: "GET", auth_type: "api_key", status: "healthy", last_tested_at: "2026-07-05T11:00:00Z", last_test_latency_ms: 155, imported_from: "manual", usedBy: 1 },
  ],
  p2: [
    { id: "r6", name: "App Store Connect", url: "https://api.appstoreconnect.apple.com/v1/sales", method: "GET", auth_type: "oauth", status: "healthy", last_tested_at: "2026-07-08T09:00:00Z", last_test_latency_ms: 410, imported_from: "openapi", usedBy: 2 },
    { id: "r7", name: "Mixpanel Funnels", url: "https://mixpanel.com/api/2.0/funnels", method: "GET", auth_type: "bearer", status: "healthy", last_tested_at: "2026-07-07T14:00:00Z", last_test_latency_ms: 190, imported_from: "manual", usedBy: 2 },
  ],
  p3: [
    { id: "r8", name: "Zendesk Tickets", url: "https://api.zendesk.com/v2/tickets", method: "GET", auth_type: "bearer", status: "healthy", last_tested_at: "2026-07-08T07:00:00Z", last_test_latency_ms: 260, imported_from: "postman", usedBy: 6 },
    { id: "r9", name: "Intercom Conversations", url: "https://api.intercom.io/conversations", method: "GET", auth_type: "bearer", status: "healthy", last_tested_at: "2026-07-08T07:20:00Z", last_test_latency_ms: 175, imported_from: "manual", usedBy: 5 },
  ],
};

export const initialWidgetsByProject: Record<string, Widget[]> = {
  p1: [
    { id: "w1", name: "Monthly Revenue", type: "line", is_template: false, resource: "Stripe Revenue", updated_at: "2026-07-08" },
    { id: "w2", name: "Revenue by Region", type: "bar", is_template: false, resource: "Stripe Revenue", updated_at: "2026-07-07" },
    { id: "w3", name: "Active Customers", type: "stat", is_template: false, resource: "Postgres Metrics Export", updated_at: "2026-07-06" },
    { id: "w4", name: "Health Score Table", type: "table", is_template: false, resource: "Customer Health Score", updated_at: "2026-07-05" },
    { id: "w5", name: "Plan Mix", type: "donut", is_template: false, resource: "Postgres Metrics Export", updated_at: "2026-07-05" },
    { id: "w6", name: "Shipping Coverage", type: "map", is_template: false, resource: "Shipping SLA Feed", updated_at: "2026-07-04" },
    { id: "w7", name: "Standard KPI Row", type: "stat", is_template: true, resource: "Stripe Revenue", updated_at: "2026-06-20" },
  ],
  p2: [
    { id: "w8", name: "DAU", type: "line", is_template: false, resource: "Mixpanel Funnels", updated_at: "2026-07-06" },
    { id: "w9", name: "Install Sources", type: "donut", is_template: false, resource: "App Store Connect", updated_at: "2026-07-04" },
  ],
  p3: [
    { id: "w10", name: "Open Tickets", type: "stat", is_template: false, resource: "Zendesk Tickets", updated_at: "2026-07-08" },
    { id: "w11", name: "CSAT Trend", type: "line", is_template: false, resource: "Intercom Conversations", updated_at: "2026-07-07" },
    { id: "w12", name: "Tickets by Channel", type: "bar", is_template: false, resource: "Zendesk Tickets", updated_at: "2026-07-06" },
  ],
};

export const initialDashboardsByProject: Record<string, Dashboard[]> = {
  p1: [
    { id: "d1", name: "Executive Overview", slug: "exec-overview-8fk2", status: "published", updated_at: "2026-07-08T12:00:00Z", widgetIds: ["w1", "w2", "w3", "w5"] },
    { id: "d2", name: "Customer Health", slug: "customer-health-a91x", status: "draft", updated_at: "2026-07-07T09:00:00Z", widgetIds: ["w4", "w3"] },
    { id: "d3", name: "Logistics", slug: "logistics-qz01", status: "draft", updated_at: "2026-07-01T09:00:00Z", widgetIds: ["w6"] },
    { id: "d4", name: "Revenue Deep Dive", slug: "revenue-deep-3lm9", status: "published", updated_at: "2026-06-29T09:00:00Z", widgetIds: ["w1", "w2"] },
  ],
  p2: [
    { id: "d5", name: "Growth", slug: "growth-9pl2", status: "draft", updated_at: "2026-07-06T09:00:00Z", widgetIds: ["w8", "w9"] },
    { id: "d6", name: "Public Beta Metrics", slug: "beta-metrics-r7q1", status: "published", updated_at: "2026-06-30T09:00:00Z", widgetIds: ["w8"] },
  ],
  p3: [
    { id: "d7", name: "Support Health", slug: "support-health-k2m8", status: "published", updated_at: "2026-07-08T09:00:00Z", widgetIds: ["w10", "w11", "w12"] },
    { id: "d8", name: "Channel Breakdown", slug: "channel-breakdown-x4t2", status: "draft", updated_at: "2026-07-05T09:00:00Z", widgetIds: ["w12"] },
  ],
};

export const initialTeamByProject: Record<string, TeamMember[]> = {
  p1: [
    { id: "u1", name: "Jordan Reyes", email: "jordan@aidistudio.dev", role: "owner", invited_at: "2026-04-02" },
    { id: "u2", name: "Sam Okafor", email: "sam@northwind.dev", role: "editor", invited_at: "2026-04-10" },
    { id: "u3", name: "Priya Shah", email: "priya@northwind.dev", role: "editor", invited_at: "2026-05-01" },
    { id: "u4", name: "Miguel Torres", email: "miguel@northwind.dev", role: "viewer", invited_at: "2026-05-15" },
  ],
  p2: [{ id: "u1", name: "Jordan Reyes", email: "jordan@aidistudio.dev", role: "owner", invited_at: "2026-05-14" }],
  p3: [
    { id: "u1", name: "Jordan Reyes", email: "jordan@aidistudio.dev", role: "owner", invited_at: "2026-01-20" },
    { id: "u5", name: "Ana Kowalski", email: "ana@supportops.dev", role: "editor", invited_at: "2026-02-02" },
    { id: "u6", name: "Dev Patel", email: "dev@supportops.dev", role: "viewer", invited_at: "2026-02-10" },
  ],
};

export const initialBillingByProject: Record<string, Billing> = {
  p1: {
    plan: "pro",
    status: "active",
    seats: 4,
    pricePerSeat: 29,
    current_period_end: "2026-08-02",
    card: { brand: "Visa", last4: "4242", exp: "09/28" },
    invoices: [
      { id: "in_1", date: "2026-06-02", amount: 116, status: "paid" },
      { id: "in_2", date: "2026-05-02", amount: 116, status: "paid" },
      { id: "in_3", date: "2026-04-02", amount: 87, status: "paid" },
    ],
  },
  p2: { plan: "free", status: "active", seats: 1, pricePerSeat: 0, current_period_end: null, card: null, invoices: [] },
  p3: {
    plan: "team",
    status: "active",
    seats: 3,
    pricePerSeat: 49,
    current_period_end: "2026-07-20",
    card: { brand: "Mastercard", last4: "8821", exp: "02/27" },
    invoices: [
      { id: "in_4", date: "2026-06-20", amount: 147, status: "paid" },
      { id: "in_5", date: "2026-05-20", amount: 147, status: "paid" },
    ],
  },
};
