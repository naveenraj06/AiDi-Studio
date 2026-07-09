import { Widget } from "./types";

export const widgets: Widget[] = [
  { id: "w-1", name: "Sales Over Time", type: "line", apiResourceId: "res-1", isTemplate: false, updatedAt: "1 day ago", mapping: [{ field: "date", role: "X axis", dataType: "date" }, { field: "revenue", role: "Y axis", dataType: "number" }, { field: "region", role: "Series", dataType: "string" }] },
  { id: "w-2", name: "Top Products", type: "bar", apiResourceId: "res-2", isTemplate: false, updatedAt: "2 days ago", mapping: [{ field: "product", role: "X axis", dataType: "string" }, { field: "units", role: "Y axis", dataType: "number" }] },
  { id: "w-3", name: "Customer List", type: "table", apiResourceId: "res-4", isTemplate: false, updatedAt: "3 days ago", mapping: [{ field: "name", role: "Column", dataType: "string" }, { field: "email", role: "Column", dataType: "string" }, { field: "plan", role: "Column", dataType: "string" }] },
  { id: "w-4", name: "Revenue KPI", type: "stat", apiResourceId: "res-1", isTemplate: false, updatedAt: "5 days ago", mapping: [{ field: "total_revenue", role: "Value", dataType: "number" }] },
  { id: "w-5", name: "Geo Distribution", type: "map", apiResourceId: "res-2", isTemplate: false, updatedAt: "1 week ago", mapping: [{ field: "country", role: "Region", dataType: "string" }, { field: "orders", role: "Value", dataType: "number" }] },
  { id: "w-6", name: "Active Users", type: "stat", apiResourceId: "res-3", isTemplate: false, updatedAt: "1 day ago", mapping: [{ field: "active_users", role: "Value", dataType: "number" }] },
  { id: "w-7", name: "Conversion Rate", type: "stat", apiResourceId: "res-2", isTemplate: false, updatedAt: "2 days ago", mapping: [{ field: "conversion_rate", role: "Value", dataType: "number" }] },
];

export const widgetTemplates = [
  { id: "t-1", name: "Stripe Revenue Pack", widgetCount: 4, apiSource: "Stripe" },
  { id: "t-2", name: "GitHub Activity Board", widgetCount: 3, apiSource: "GitHub" },
];

// Sample API response data for widget builder preview + live widgets
export const sampleTimeSeries = [
  { date: "Jan", revenue: 21000, orders: 210 },
  { date: "Feb", revenue: 28000, orders: 265 },
  { date: "Mar", revenue: 32000, orders: 298 },
  { date: "Apr", revenue: 29000, orders: 275 },
  { date: "May", revenue: 36000, orders: 320 },
  { date: "Jun", revenue: 40000, orders: 350 },
  { date: "Jul", revenue: 38900, orders: 340 },
];

export const sampleBarData = [
  { name: "Widget A", units: 420 },
  { name: "Widget B", units: 380 },
  { name: "Widget C", units: 310 },
  { name: "Widget D", units: 275 },
  { name: "Widget E", units: 190 },
];

export const sampleDonutData = [
  { name: "North", value: 38200 },
  { name: "South", value: 31500 },
  { name: "East", value: 28800 },
  { name: "West", value: 19300 },
];

export const sampleTableRows = [
  { name: "Acme Inc.", email: "billing@acme.com", plan: "Enterprise", status: "Active" },
  { name: "Globex Corp", email: "finance@globex.com", plan: "Pro", status: "Active" },
  { name: "Initech", email: "ap@initech.com", plan: "Pro", status: "Past due" },
  { name: "Soylent Co", email: "hello@soylent.com", plan: "Starter", status: "Active" },
];

export const sampleRawApiResponse = [
  { date: "2026-07-01", revenue: 42500, orders: 318, region: "North" },
  { date: "2026-07-02", revenue: 38900, orders: 254, region: "South" },
  { date: "2026-07-03", revenue: 51200, orders: 372, region: "East" },
  { date: "2026-07-04", revenue: 36500, orders: 248, region: "North" },
];
