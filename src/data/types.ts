export type ApiResource = {
  id: string;
  name: string;
  url: string;
  method: "GET";
  authType: "Bearer" | "API Key" | "OAuth" | "None";
  status: "healthy" | "error";
  usedByCount: number;
  lastTested: string;
};

export type WidgetType = "line" | "bar" | "stat" | "table" | "donut" | "map";

export type Widget = {
  id: string;
  name: string;
  type: WidgetType;
  apiResourceId: string;
  isTemplate: boolean;
  updatedAt: string;
  mapping: { field: string; role: string; dataType: string }[];
};

export type DashboardStatus = "draft" | "published";

export type Dashboard = {
  id: string;
  projectId: string;
  name: string;
  status: DashboardStatus;
  visibility: "public" | "private";
  widgetIds: string[];
  updatedAt: string;
  slug: string;
};

export type Project = {
  id: string;
  name: string;
  icon: string;
  color: string;
  dashboardCount: number;
  widgetCount: number;
  updatedAt: string;
};
