import { Dashboard } from "./types";

export const dashboards: Dashboard[] = [
  { id: "d-1", projectId: "marketing-analytics", name: "Executive Overview", status: "published", visibility: "public", widgetIds: ["w-4", "w-6", "w-7", "w-1", "w-2", "w-3"], updatedAt: "2 hours ago", slug: "exec-overview-x9k2m" },
  { id: "d-2", projectId: "marketing-analytics", name: "Marketing Overview", status: "draft", visibility: "private", widgetIds: ["w-1", "w-2"], updatedAt: "1 day ago", slug: "marketing-overview-a3f8p" },
  { id: "d-3", projectId: "marketing-analytics", name: "Sales Performance", status: "published", visibility: "public", widgetIds: ["w-4", "w-1"], updatedAt: "2 days ago", slug: "sales-perf-k2m9q" },
  { id: "d-4", projectId: "marketing-analytics", name: "Customer Insights", status: "draft", visibility: "private", widgetIds: ["w-3"], updatedAt: "3 days ago", slug: "customer-insights-p7x2r" },
  { id: "d-5", projectId: "marketing-analytics", name: "Product Analytics", status: "published", visibility: "public", widgetIds: ["w-5", "w-2"], updatedAt: "5 days ago", slug: "product-analytics-m4t6s" },
];
