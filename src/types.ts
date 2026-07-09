export type ActiveTab =
  | "landing"
  | "signin"
  | "projects"
  | "dashboards"
  | "widgets"
  | "schema"
  | "embed"
  | "team"
  | "settings";

export interface Project {
  id: string;
  name: string;
  description: string;
  dashboardsCount: number;
  widgetsCount: number;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  status: "Live" | "Draft";
  widgetsCount: number;
  visibility: "Public" | "Private";
  updatedAt: string;
  isArchived?: boolean;
  theme?: {
    primaryColor?: string; // hex or Tailwind color class prefix e.g., "blue", "indigo", "emerald", "rose", "violet", "amber", "pink", "cyan", "sky", "teal"
    bgStyle?: "dark-slate" | "charcoal" | "deep-blue" | "emerald-cave" | "royal-violet" | "nordic-monochrome";
    cardStyle?: "glassmorphism" | "minimalist" | "sleek-border" | "neon-accent" | "classic-dark";
    accentColor?: string; // hex or color name
    textColor?: string;
    fontStyle?: "sans" | "mono" | "grotesk" | "serif";
  };
  layout?: {
    columns?: 1 | 2 | 3 | 4;
    spacing?: "compact" | "cozy" | "spacious";
    sleekBorder?: boolean;
    showIcons?: boolean;
  };
}

export interface Widget {
  id: string;
  name: string;
  type: "line" | "bar" | "donut" | "table" | "kpi" | "map";
  dataSource: string;
  queryType: string;
  data: any;
  updatedAt: string;
  config?: Record<string, any>;
  apiEndpoint?: string;
  apiMethod?: string;
  headers?: { key: string; value: string }[];
  requestPayload?: string;
  responseSchema?: string;
  assignedDashboards?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer";
  avatar: string;
}

export interface SchemaMappingHistory {
  id: string;
  timestamp: string;
  sourceRows: number;
  targetRows: number;
  durationMs: number;
  status: "success" | "error";
  throughput: number; // rows/sec
}
