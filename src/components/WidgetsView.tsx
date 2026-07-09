import React, { useState, useEffect } from "react";
import {
  ToyBrick,
  Plus,
  Trash2,
  LineChart as LineIcon,
  BarChart as BarIcon,
  PieChart as DonutIcon,
  Table as TableIcon,
  Coins,
  Map as MapIcon,
  ChevronRight,
  Database,
  ArrowLeft,
  Sparkles,
  Copy,
  Sliders,
  Globe,
  Code,
  Edit3,
  Send,
  FileJson,
  AlertCircle,
  RefreshCw,
  EyeOff,
  Library,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  X
} from "lucide-react";
import { Widget } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface WidgetsViewProps {
  selectedDashboardId?: string;
  onBackToDashboards: () => void;
}

const mockSalesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
];

const mockProductsData = [
  { name: "SaaS Pro", count: 420 },
  { name: "API Access", count: 310 },
  { name: "Support Tier", count: 180 },
  { name: "Consulting", count: 90 },
];

const mockDonutData = [
  { name: "Direct", value: 420, color: "#4f46e5" },
  { name: "Email", value: 260, color: "#3b82f6" },
  { name: "Social", value: 180, color: "#0d9488" },
  { name: "Referral", value: 140, color: "#a855f7" },
];

// Helper to dynamically extract keys for Recharts plotting
const getChartKeys = (data: any) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { xAxisKey: "name", yAxisKey: "value" };
  }
  const firstRow = data[0];
  if (typeof firstRow !== "object" || firstRow === null) {
    return { xAxisKey: "name", yAxisKey: "value" };
  }
  const keys = Object.keys(firstRow);
  
  // Find xAxisKey
  let xAxisKey = keys.find(k => ["name", "label", "key", "date", "timestamp", "month", "day", "category"].includes(k.toLowerCase()));
  if (!xAxisKey) {
    xAxisKey = keys.find(k => typeof firstRow[k] === "string") || keys[0];
  }
  
  // Find yAxisKey
  let yAxisKey = keys.find(k => ["value", "sales", "count", "amount", "qty", "percentage", "total", "clicks", "users"].includes(k.toLowerCase()));
  if (!yAxisKey) {
    yAxisKey = keys.find(k => typeof firstRow[k] === "number") || keys.find(k => !isNaN(Number(firstRow[k]))) || keys[1] || keys[0];
  }
  
  return { xAxisKey, yAxisKey };
};

// Helper to safely format KPI values
const getKpiData = (data: any) => {
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      if (data.length > 0) return getKpiData(data[0]);
      return { amount: "$0", trend: "+0%", text: "Metric" };
    }
    const amount = data.amount || data.value || data.total || data.count || "$0";
    const trend = data.trend || data.percentage || data.change || "+0%";
    const text = data.text || data.title || data.label || "KPI Summary";
    return { amount: String(amount), trend: String(trend), text: String(text) };
  }
  return { amount: String(data || "$0"), trend: "+0%", text: "Summary Metric" };
};

export default function WidgetsView({ selectedDashboardId, onBackToDashboards }: WidgetsViewProps) {
  // Load dynamic dashboards from store so new or modified ones are immediately available
  const [storedDashboards, setStoredDashboards] = useState<any[]>(() => {
    const saved = localStorage.getItem("dashboards_store");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "executive", name: "Executive Overview", status: "Live", visibility: "Public", theme: { primaryColor: "indigo" } },
      { id: "marketing", name: "Marketing Overview", status: "Draft", visibility: "Private", theme: { primaryColor: "pink" } },
      { id: "sales", name: "Sales Performance", status: "Live", visibility: "Public", theme: { primaryColor: "emerald" } },
      { id: "customer", name: "Customer Insights", status: "Draft", visibility: "Private", theme: { primaryColor: "amber" } },
      { id: "product", name: "Product Analytics", status: "Live", visibility: "Public", theme: { primaryColor: "cyan" } },
    ];
  });

  // Load and persist widgets using localStorage
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem("widgets_store");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "sales-over-time",
        name: "Sales Over Time",
        type: "line",
        dataSource: "REST API Pipeline",
        queryType: "GET /api/analytics/sales",
        data: mockSalesData,
        updatedAt: "Updated 1 day ago",
        apiEndpoint: "/api/analytics/sales",
        apiMethod: "GET",
        headers: [{ key: "Authorization", value: "Bearer token123" }],
        responseSchema: `{\n  "type": "array",\n  "items": {\n    "name": "string",\n    "sales": "number"\n  }\n}`,
        assignedDashboards: ["executive", "sales"]
      },
      {
        id: "top-products",
        name: "Top Products",
        type: "bar",
        dataSource: "Sales Database",
        queryType: "POST /api/products/volumes",
        data: mockProductsData,
        updatedAt: "Updated 2 days ago",
        apiEndpoint: "/api/products/volumes",
        apiMethod: "POST",
        headers: [{ key: "Content-Type", value: "application/json" }],
        requestPayload: `{\n  "categoryFilter": "all",\n  "limit": 10\n}`,
        responseSchema: `{\n  "type": "array",\n  "items": {\n    "name": "string",\n    "count": "number"\n  }\n}`,
        assignedDashboards: ["sales", "product"]
      },
      {
        id: "customer-list",
        name: "Customer List",
        type: "table",
        dataSource: "CRM Database",
        queryType: "GET /api/crm/customers",
        data: [
          { name: "Acme Corp", industry: "SaaS", status: "Active", ltv: "$12,400" },
          { name: "Globex Inc", industry: "Finance", status: "Active", ltv: "$9,800" },
          { name: "Intech Solutions", industry: "Consulting", status: "Pending", ltv: "$6,500" },
          { name: "Soylent Tech", industry: "Hardware", status: "Inactive", ltv: "$4,200" },
        ],
        updatedAt: "Updated 3 days ago",
        apiEndpoint: "/api/crm/customers",
        apiMethod: "GET",
        headers: [],
        responseSchema: `{\n  "type": "array",\n  "items": {\n    "name": "string",\n    "industry": "string",\n    "status": "string",\n    "ltv": "string"\n  }\n}`,
        assignedDashboards: ["customer"]
      },
      {
        id: "revenue-kpi",
        name: "Revenue KPI",
        type: "kpi",
        dataSource: "Stripe Webhook",
        queryType: "GET /api/stripe/metrics",
        data: { amount: "$98,346", trend: "-10.4%", text: "Revenue KPI" },
        updatedAt: "Updated 5 days ago",
        apiEndpoint: "/api/stripe/metrics",
        apiMethod: "GET",
        headers: [],
        responseSchema: `{\n  "type": "object",\n  "properties": {\n    "amount": "string",\n    "trend": "string",\n    "text": "string"\n  }\n}`,
        assignedDashboards: ["executive"]
      },
      {
        id: "geo-distribution",
        name: "Geo Distribution",
        type: "map",
        dataSource: "IP Geolocation",
        queryType: "GET /api/geo/countries",
        data: [
          { country: "United States", percentage: 55 },
          { country: "Germany", percentage: 22 },
          { country: "United Kingdom", percentage: 13 },
          { country: "Japan", percentage: 10 },
        ],
        updatedAt: "Updated 1 week ago",
        apiEndpoint: "/api/geo/countries",
        apiMethod: "GET",
        headers: [],
        responseSchema: `{\n  "type": "array",\n  "items": {\n    "country": "string",\n    "percentage": "number"\n  }\n}`,
        assignedDashboards: ["marketing", "executive"]
      },
    ];
  });

  // Save widgets when changed
  useEffect(() => {
    localStorage.setItem("widgets_store", JSON.stringify(widgets));
  }, [widgets]);

  // Sync dashboard changes from localStorage
  const refreshDashboards = () => {
    const saved = localStorage.getItem("dashboards_store");
    if (saved) {
      try {
        setStoredDashboards(JSON.parse(saved));
      } catch (e) {}
    }
  };

  // Filters & Modal States
  const [dashboardFilter, setDashboardFilter] = useState<string>(selectedDashboardId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"api" | "mapping" | "preview">("api");

  // Check for auto-open trigger from dashboard page
  useEffect(() => {
    const triggerDashId = localStorage.getItem("open_widget_library_for_dashboard");
    if (triggerDashId) {
      localStorage.removeItem("open_widget_library_for_dashboard");
      setDashboardFilter(triggerDashId);
      setShowLibraryModal(true);
    }
  }, []);

  // Form Fields State
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null);
  const [newWidgetName, setNewWidgetName] = useState("");
  const [newWidgetType, setNewWidgetType] = useState<Widget["type"]>("line");
  const [newWidgetDS, setNewWidgetDS] = useState("REST API Pipeline");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [requestPayload, setRequestPayload] = useState("");
  const [responseSchema, setResponseSchema] = useState("");
  const [mockData, setMockData] = useState("");
  const [assignedDashboards, setAssignedDashboards] = useState<string[]>(["all"]);

  // AI Suggestion state
  const [widgetGoal, setWidgetGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  
  // Interactive Live Preview Local data
  const [previewParsedData, setPreviewParsedData] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync builder preview whenever mock data changes
  useEffect(() => {
    if (mockData) {
      try {
        const parsed = JSON.parse(mockData);
        setPreviewParsedData(parsed);
        setJsonError(null);
      } catch (err: any) {
        setJsonError(err.message || "Invalid JSON syntax");
      }
    } else {
      setPreviewParsedData(null);
      setJsonError(null);
    }
  }, [mockData]);

  const resetForm = () => {
    setCloneSourceId(null);
    setNewWidgetName("");
    setNewWidgetType("line");
    setNewWidgetDS("REST API Pipeline");
    setApiEndpoint("");
    setApiMethod("GET");
    setHeaders([]);
    setRequestPayload("");
    setResponseSchema("");
    setMockData("");
    setAssignedDashboards(["all"]);
    setWidgetGoal("");
    setAiExplanation("");
    setPreviewParsedData(null);
    setJsonError(null);
    setActiveTab("api");
  };

  const handleOpenNewBuilder = () => {
    resetForm();
    if (selectedDashboardId && selectedDashboardId !== "all") {
      setAssignedDashboards([selectedDashboardId]);
    }
    setShowBuilder(true);
  };

  // Header dynamic inputs list manipulation
  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (idx: number) => setHeaders(headers.filter((_, i) => i !== idx));
  const updateHeader = (idx: number, field: "key" | "value", val: string) => {
    const updated = [...headers];
    updated[idx][field] = val;
    setHeaders(updated);
  };

  // Trigger Gemini API endpoint to suggest component type & mock data schema
  const handleAISuggest = async () => {
    if (!widgetGoal.trim()) return;
    setIsGenerating(true);
    setAiExplanation("");

    try {
      const response = await fetch("/api/widget/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetGoal,
          apiEndpoint,
          apiMethod,
          requestPayload
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact dynamic AI Architect");
      }

      const resJson = await response.json();
      
      // Successfully generated config from AI
      if (resJson.componentSuggestion) {
        setNewWidgetType(resJson.componentSuggestion as Widget["type"]);
      }
      if (resJson.explanation) {
        setAiExplanation(resJson.explanation);
      }
      if (resJson.suggestedSchema) {
        setResponseSchema(JSON.stringify(resJson.suggestedSchema, null, 2));
      }
      if (resJson.sampleData) {
        setMockData(JSON.stringify(resJson.sampleData, null, 2));
      }

      // Automatically jump to Preview tab so user can see it load instantly
      setActiveTab("preview");

    } catch (err: any) {
      console.error(err);
      alert("AI Service encountered an issue. Falling back to offline structural analysis template.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle widget creation, editing, or cloning
  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetName.trim()) {
      alert("Please provide a widget display name");
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(mockData || "[]");
    } catch (err) {
      alert("Expected Response Sample must be valid JSON in order to save and compile.");
      setActiveTab("preview");
      return;
    }

    const currentQueryType = `${apiMethod} ${apiEndpoint || "Direct Inflow Channel"}`;
    const targetId = cloneSourceId && !newWidgetName.startsWith("Copy of") 
      ? cloneSourceId 
      : newWidgetName.toLowerCase().replace(/\s+/g, "-");

    const savedWidget: Widget = {
      id: targetId,
      name: newWidgetName,
      type: newWidgetType,
      dataSource: newWidgetDS,
      queryType: currentQueryType,
      data: parsedData,
      updatedAt: "Updated just now",
      apiEndpoint,
      apiMethod,
      headers,
      requestPayload,
      responseSchema,
      assignedDashboards: assignedDashboards.length > 0 ? assignedDashboards : ["all"]
    };

    if (cloneSourceId && !newWidgetName.startsWith("Copy of")) {
      // Editing in-place
      setWidgets(widgets.map(w => w.id === cloneSourceId ? savedWidget : w));
    } else {
      // Create new or saved cloned widget
      setWidgets([...widgets, savedWidget]);
    }

    setShowBuilder(false);
    resetForm();
  };

  // Edit Mode Launcher
  const handleEditWidget = (widget: Widget, e: React.MouseEvent) => {
    e.stopPropagation();
    setCloneSourceId(widget.id);
    setNewWidgetName(widget.name);
    setNewWidgetType(widget.type);
    setNewWidgetDS(widget.dataSource);
    setApiEndpoint(widget.apiEndpoint || "");
    setApiMethod(widget.apiMethod || "GET");
    setHeaders(widget.headers || []);
    setRequestPayload(widget.requestPayload || "");
    setResponseSchema(widget.responseSchema || "");
    setMockData(JSON.stringify(widget.data, null, 2));
    setAssignedDashboards(widget.assignedDashboards || ["all"]);
    setWidgetGoal("");
    setAiExplanation("");
    setActiveTab("api");
    setShowBuilder(true);
  };

  // Clone Mode Launcher
  const handleCloneWidget = (widget: Widget, e: React.MouseEvent) => {
    e.stopPropagation();
    setCloneSourceId(widget.id);
    setNewWidgetName(`Copy of ${widget.name}`);
    setNewWidgetType(widget.type);
    setNewWidgetDS(widget.dataSource);
    setApiEndpoint(widget.apiEndpoint || "");
    setApiMethod(widget.apiMethod || "GET");
    setHeaders(widget.headers || []);
    setRequestPayload(widget.requestPayload || "");
    setResponseSchema(widget.responseSchema || "");
    setMockData(JSON.stringify(widget.data, null, 2));
    setAssignedDashboards(widget.assignedDashboards || ["all"]);
    setWidgetGoal("");
    setAiExplanation("");
    setActiveTab("api");
    setShowBuilder(true);
  };

  const handleDeleteWidget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this widget?")) {
      setWidgets(widgets.filter((w) => w.id !== id));
    }
  };

  // Toggle linkage of a widget to any dashboard
  const toggleWidgetLink = (widgetId: string, dashboardId: string) => {
    const updated = widgets.map(w => {
      if (w.id === widgetId) {
        const assigned = w.assignedDashboards || [];
        if (assigned.includes(dashboardId)) {
          // Unlink it
          const nextAssigned = assigned.filter(id => id !== dashboardId);
          return {
            ...w,
            assignedDashboards: nextAssigned.length === 0 ? ["all"] : nextAssigned,
            updatedAt: "Updated just now"
          };
        } else {
          // Link it, remove "all" if present to avoid pollution
          const nextAssigned = assigned.filter(id => id !== "all");
          return {
            ...w,
            assignedDashboards: [...nextAssigned, dashboardId],
            updatedAt: "Updated just now"
          };
        }
      }
      return w;
    });
    setWidgets(updated);
  };

  // Active Dashboard Theme and Layout Resolution
  const activeDashboard = storedDashboards.find(d => d.id === dashboardFilter);
  const activeTheme = activeDashboard?.theme || {
    primaryColor: "indigo",
    bgStyle: "charcoal",
    cardStyle: "sleek-border",
    fontStyle: "sans"
  };

  const activeLayout = activeDashboard?.layout || {
    columns: 3,
    spacing: "cozy",
    sleekBorder: true
  };

  const ACCENT_MAP: Record<string, { hex: string; text: string; bg: string; border: string; glow: string }> = {
    indigo: { hex: "#4f46e5", text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "shadow-indigo-500/10" },
    pink: { hex: "#ec4899", text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-pink-500/10" },
    emerald: { hex: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
    amber: { hex: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
    cyan: { hex: "#06b6d4", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/10" },
    violet: { hex: "#8b5cf6", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/10" },
    rose: { hex: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/10" },
  };

  const currentAccent = ACCENT_MAP[activeTheme.primaryColor || "indigo"] || ACCENT_MAP.indigo;

  const BG_STYLE_MAP: Record<string, string> = {
    "dark-slate": "bg-[#0c0d12] border border-zinc-800/60 rounded-2xl p-6 shadow-2xl",
    "charcoal": "bg-[#09090b] border border-zinc-900 rounded-2xl p-6",
    "deep-blue": "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] border border-blue-950/40 rounded-2xl p-6 shadow-2xl",
    "emerald-cave": "bg-gradient-to-br from-[#011410] via-[#022c22] to-[#011410] border border-emerald-950/40 rounded-2xl p-6 shadow-2xl",
    "royal-violet": "bg-gradient-to-br from-[#0b031a] via-[#1f0a2e] to-[#0a0217] border border-purple-950/40 rounded-2xl p-6 shadow-2xl",
    "nordic-monochrome": "bg-[#0f1015] border border-zinc-800 rounded-2xl p-6"
  };

  const CARD_STYLE_MAP: Record<string, string> = {
    glassmorphism: "bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg",
    minimalist: "bg-transparent border border-zinc-800 hover:border-zinc-700 shadow-none rounded-none",
    "sleek-border": "bg-[#0a0a0c] border border-zinc-800/80 hover:border-zinc-700/80 hover:shadow-md",
    "neon-accent": "bg-[#0e0e11] border-x border-b border-zinc-800/80",
    "classic-dark": "bg-[#141416] border border-[#27272a] hover:bg-[#1c1c21]"
  };

  const FONT_MAP: Record<string, string> = {
    sans: "font-sans",
    grotesk: "font-sans tracking-tight font-medium",
    mono: "font-mono text-xs",
    serif: "font-serif"
  };

  // Live settings dynamic updates
  const updateDashboardTheme = (themeUpdates: Partial<typeof activeTheme>) => {
    if (dashboardFilter === "all") return;
    const updatedList = storedDashboards.map((d) => {
      if (d.id === dashboardFilter) {
        return {
          ...d,
          theme: {
            ...d.theme,
            ...themeUpdates
          },
          updatedAt: "Updated just now"
        };
      }
      return d;
    });
    setStoredDashboards(updatedList);
    localStorage.setItem("dashboards_store", JSON.stringify(updatedList));
  };

  const updateDashboardLayout = (layoutUpdates: Partial<typeof activeLayout>) => {
    if (dashboardFilter === "all") return;
    const updatedList = storedDashboards.map((d) => {
      if (d.id === dashboardFilter) {
        return {
          ...d,
          layout: {
            ...d.layout,
            ...layoutUpdates
          },
          updatedAt: "Updated just now"
        };
      }
      return d;
    });
    setStoredDashboards(updatedList);
    localStorage.setItem("dashboards_store", JSON.stringify(updatedList));
  };

  // Filter widgets by active query and selected dashboard assignment
  const filteredWidgets = widgets.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (dashboardFilter === "all") return true;
    if (!w.assignedDashboards) return true; // Default legacy to all
    return w.assignedDashboards.includes("all") || w.assignedDashboards.includes(dashboardFilter);
  });

  // Dynamic visual layout rendering
  const renderWidgetVisuals = (widget: Widget) => {
    const dataToUse = widget.data;

    switch (widget.type) {
      case "line": {
        const { xAxisKey, yAxisKey } = getChartKeys(dataToUse);
        return (
          <div className="h-40 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(dataToUse) ? dataToUse : []}>
                <XAxis dataKey={xAxisKey} stroke="#71717a" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                  labelStyle={{ color: "#71717a", fontSize: "10px" }}
                  itemStyle={{ color: "#fafafa", fontSize: "11px" }}
                />
                <Line type="monotone" dataKey={yAxisKey} stroke={currentAccent.hex} strokeWidth={2.5} dot={{ r: 3, fill: currentAccent.hex }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }
      case "bar": {
        const { xAxisKey, yAxisKey } = getChartKeys(dataToUse);
        return (
          <div className="h-40 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(dataToUse) ? dataToUse : []}>
                <XAxis dataKey={xAxisKey} stroke="#71717a" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                  labelStyle={{ color: "#71717a", fontSize: "10px" }}
                  itemStyle={{ color: "#fafafa", fontSize: "11px" }}
                />
                <Bar dataKey={yAxisKey} fill={currentAccent.hex} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
      case "donut": {
        const pieData = Array.isArray(dataToUse) ? dataToUse : mockDonutData;
        const { xAxisKey: nameKey, yAxisKey: valueKey } = getChartKeys(pieData);
        // Generate beautiful theme variants
        const themePieColors = [
          currentAccent.hex,
          `${currentAccent.hex}dd`,
          `${currentAccent.hex}aa`,
          `${currentAccent.hex}77`,
          `${currentAccent.hex}44`,
        ];
        return (
          <div className="h-40 w-full flex items-center justify-center pt-2">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={28} outerRadius={42}>
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={themePieColors[index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 text-[10px] text-[#71717a] space-y-1 overflow-y-auto max-h-full">
              {pieData.slice(0, 4).map((entry: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pr-4">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themePieColors[idx % 5] }} />
                    <span className="truncate">{entry[nameKey] || entry.name}</span>
                  </span>
                  <span className="font-semibold text-[#fafafa]">{entry[valueKey] || entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "kpi": {
        const kpi = getKpiData(dataToUse);
        return (
          <div className="h-40 flex flex-col justify-center bg-[#18181b]/30 px-4 rounded-lg border border-[#27272a]/40 mt-4">
            <span className="text-3xl font-mono font-bold tracking-tight" style={{ color: currentAccent.hex }}>
              {kpi.amount}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${kpi.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                {kpi.trend}
              </span>
              <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-semibold truncate max-w-[150px]">
                {kpi.text}
              </span>
            </div>
          </div>
        );
      }
      case "table": {
        const tableData = Array.isArray(dataToUse) ? dataToUse : [];
        if (tableData.length === 0) {
          return <div className="h-40 flex items-center justify-center text-xs text-[#71717a]">No records found</div>;
        }
        const cols = Object.keys(tableData[0] || {}).slice(0, 4);
        return (
          <div className="h-40 overflow-y-auto mt-4 text-[11px] border border-[#27272a] rounded-lg bg-[#09090b]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#18181b] text-[#71717a] font-bold border-b border-[#27272a] sticky top-0">
                  {cols.map((col) => (
                    <th key={col} className="p-2 capitalize">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-zinc-300">
                {tableData.slice(0, 6).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#18181b]/30">
                    {cols.map((col) => {
                      const val = row[col];
                      return (
                        <td key={col} className="p-2 truncate max-w-[120px]" title={String(val)}>
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "map": {
        const mapData = Array.isArray(dataToUse) ? dataToUse : [];
        return (
          <div className="h-40 flex flex-col justify-between mt-4 p-4 rounded-lg bg-[#18181b]/30 border border-[#27272a]/40 text-xs overflow-y-auto">
            <div className="space-y-2.5">
              {mapData.slice(0, 3).map((item: any, idx: number) => {
                const country = item.country || item.name || item.region || "Unknown";
                const percentage = item.percentage || item.value || item.percent || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-300 font-medium truncate max-w-[140px]">{country}</span>
                      <span className="font-bold font-mono" style={{ color: currentAccent.hex }}>{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: currentAccent.hex }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Convert column settings to Tailwind class
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Convert spacing settings to class
  const getGapClass = (spacing: string) => {
    switch (spacing) {
      case "compact": return "gap-4 p-4";
      case "spacious": return "gap-8 p-8";
      default: return "gap-6 p-6";
    }
  };

  return (
    <div className={`space-y-8 animate-fade-in ${FONT_MAP[activeTheme.fontStyle || "sans"]}`}>
      {/* Back Link */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={onBackToDashboards}
          className="flex items-center gap-2 text-[#3b82f6] hover:text-blue-400 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          id="back-to-dashboards-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboards
        </button>

        {activeDashboard?.isArchived && (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-[4px] text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5" /> ARCHIVED (Restricted from public)
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ToyBrick className="w-5.5 h-5.5 text-[#3b82f6]" />
            {dashboardFilter === "all" ? "Enterprise Analytics Builder" : activeDashboard?.name}
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            {dashboardFilter === "all" 
              ? "Build bespoke visual widgets, assign secure API connections, or prompt our AI Architect to compile layouts."
              : `Active Workspace Dashboard Profile. Adapts layout, colors, grids, and fonts in real-time.`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {dashboardFilter !== "all" && (
            <button
              onClick={() => setShowLibraryModal(true)}
              className="bg-zinc-900 border border-zinc-800 hover:border-[#3b82f6]/50 text-[#3b82f6] hover:text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md"
              id="open-library-modal-btn"
            >
              <Library className="w-4 h-4 text-amber-400" />
              Add from Library
            </button>
          )}
          <button
            onClick={handleOpenNewBuilder}
            className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all self-start cursor-pointer shadow-lg shadow-blue-500/20"
            id="open-widget-builder-btn"
          >
            <Plus className="w-4 h-4" />
            Create Widget
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#09090b] border border-[#27272a] p-4 rounded-xl">
        <div className="relative flex-1">
          <Sliders className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
            placeholder="Search active workspace widgets..."
            id="widgets-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
            Active Workspace Scope:
          </span>
          <select
            value={dashboardFilter}
            onChange={(e) => setDashboardFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] cursor-pointer"
          >
            <option value="all">All Widgets Combined (Global List)</option>
            {storedDashboards.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} {d.isArchived ? "🔒 (Archived)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTIVE DASHBOARD LIVE TAILWIND CUSTOMIZATION HUD */}
      {dashboardFilter !== "all" && activeDashboard && (
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-xl space-y-4 animate-scale-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Dashboard Customization Console
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Tailwind configurations saved to index instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            {/* Accent selection */}
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                Accent Theme color
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "indigo", color: "#4f46e5" },
                  { id: "pink", color: "#ec4899" },
                  { id: "emerald", color: "#10b981" },
                  { id: "amber", color: "#f59e0b" },
                  { id: "cyan", color: "#06b6d4" },
                  { id: "violet", color: "#8b5cf6" },
                  { id: "rose", color: "#f43f5e" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateDashboardTheme({ primaryColor: item.id })}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                      activeTheme.primaryColor === item.id ? "border-white ring-2 ring-[#3b82f6]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={`Apply ${item.id} Accent`}
                  />
                ))}
              </div>
            </div>

            {/* Background Style selection */}
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                Background style
              </span>
              <select
                value={activeTheme.bgStyle || "charcoal"}
                onChange={(e) => updateDashboardTheme({ bgStyle: e.target.value as any })}
                className="w-full bg-[#18181b] border border-zinc-800 rounded p-1.5 text-xs text-zinc-300"
              >
                <option value="charcoal">Charcoal Minimalist</option>
                <option value="dark-slate">Slate Nebula</option>
                <option value="deep-blue">Abyssal space</option>
                <option value="emerald-cave">Emerald Depths</option>
                <option value="royal-violet">Cyber royal purple</option>
                <option value="nordic-monochrome">Polar night</option>
              </select>
            </div>

            {/* Card Style selection */}
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                Cards Aesthetic
              </span>
              <select
                value={activeTheme.cardStyle || "sleek-border"}
                onChange={(e) => updateDashboardTheme({ cardStyle: e.target.value as any })}
                className="w-full bg-[#18181b] border border-zinc-800 rounded p-1.5 text-xs text-zinc-300"
              >
                <option value="sleek-border">Adaptive Sleek Border</option>
                <option value="glassmorphism">Glassmorphic Blur</option>
                <option value="minimalist">Minimal Stark Line</option>
                <option value="neon-accent">Glowing Top LED</option>
                <option value="classic-dark">Elevated Solid Carbon</option>
              </select>
            </div>

            {/* Columns Layout */}
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                Grid Columns Width
              </span>
              <select
                value={activeLayout.columns || 3}
                onChange={(e) => updateDashboardLayout({ columns: Number(e.target.value) as any })}
                className="w-full bg-[#18181b] border border-zinc-800 rounded p-1.5 text-xs text-zinc-300"
              >
                <option value={1}>1 Column (Full Ledger)</option>
                <option value={2}>2 Columns (Wide Split)</option>
                <option value={3}>3 Columns (Standard Bento)</option>
                <option value={4}>4 Columns (Dense Grid)</option>
              </select>
            </div>

            {/* Font Style selection */}
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">
                Dashboard Font
              </span>
              <select
                value={activeTheme.fontStyle || "sans"}
                onChange={(e) => updateDashboardTheme({ fontStyle: e.target.value as any })}
                className="w-full bg-[#18181b] border border-zinc-800 rounded p-1.5 text-xs text-zinc-300"
              >
                <option value="sans">Inter Sans</option>
                <option value="grotesk">Space Grotesk</option>
                <option value="mono">JetBrains Mono</option>
                <option value="serif">Georgia Serif</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE MAIN THEME IMMERSIVE WRAPPER (Adapts dynamically based on active dashboard bg style!) */}
      <div className={dashboardFilter !== "all" ? (BG_STYLE_MAP[activeTheme.bgStyle || "charcoal"] || BG_STYLE_MAP.charcoal) : "bg-[#09090b] border border-zinc-900 rounded-2xl p-6"}>
        
        {/* Custom Header Title within theme */}
        {dashboardFilter !== "all" && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentAccent.hex }} />
                {activeDashboard?.name} Analytics Gateway
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Rendered with {activeTheme.cardStyle} layout spacing
              </p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-950/60 text-zinc-400 border border-zinc-800">
              {activeLayout.columns || 3} Columns Default
            </span>
          </div>
        )}

        {/* Grid of widgets */}
        <div className={`grid gap-6 ${getGridColsClass(activeLayout.columns || 3)}`}>
          {filteredWidgets.map((widget) => {
            const hasNeonLED = activeTheme.cardStyle === "neon-accent" && dashboardFilter !== "all";
            return (
              <div
                key={widget.id}
                className={`flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                  dashboardFilter !== "all" 
                    ? CARD_STYLE_MAP[activeTheme.cardStyle || "sleek-border"] || CARD_STYLE_MAP["sleek-border"]
                    : "bg-[#09090b] border border-[#27272a] hover:border-zinc-800"
                } ${activeLayout.sleekBorder !== false ? "rounded-xl" : "rounded-none"} p-5`}
                style={{
                  borderTopColor: hasNeonLED ? currentAccent.hex : undefined,
                  borderTopWidth: hasNeonLED ? "3px" : undefined,
                  boxShadow: activeTheme.cardStyle === "glassmorphism" ? "0 4px 30px rgba(0, 0, 0, 0.1)" : undefined
                }}
                id={`widget-card-${widget.id}`}
              >
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#27272a]/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono border px-2 py-0.5 rounded font-bold capitalize" style={{
                        backgroundColor: `${currentAccent.hex}10`,
                        borderColor: `${currentAccent.hex}20`,
                        color: currentAccent.hex
                      }}>
                        {widget.type}
                      </span>
                      <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-bold uppercase">
                        {widget.apiMethod || "GET"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCloneWidget(widget, e)}
                        className="p-1.5 rounded text-[#71717a] hover:text-zinc-200 hover:bg-[#3b82f6]/5 transition-colors cursor-pointer"
                        title="Clone Widget & Modify"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleEditWidget(widget, e)}
                        className="p-1.5 rounded text-[#71717a] hover:text-zinc-200 hover:bg-[#3b82f6]/5 transition-colors cursor-pointer"
                        title="Edit Widget Configuration"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteWidget(widget.id, e)}
                        className="p-1.5 rounded text-[#71717a] hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
                        title="Delete widget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">{widget.name}</h3>
                  <p className="text-[10px] text-[#71717a] font-mono truncate mb-1">
                    {widget.apiEndpoint || "Direct Data Payload"}
                  </p>

                  {/* Visualization Rendering */}
                  {renderWidgetVisuals(widget)}
                </div>

                {/* Bottom details & Assigned list */}
                <div className="border-t border-[#27272a]/60 pt-3 mt-5 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {(widget.assignedDashboards || ["all"]).map(assignedId => {
                      const resolved = storedDashboards.find(d => d.id === assignedId);
                      return (
                        <span key={assignedId} className="text-[9px] font-semibold text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                          {resolved ? resolved.name : "All Dashboards"}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#71717a] font-medium font-mono pt-1">
                    <span className="truncate max-w-[180px]">{widget.queryType}</span>
                    <span>{widget.updatedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state creation card */}
          <div
            onClick={handleOpenNewBuilder}
            className={`border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-zinc-900/10 min-h-[290px] ${
              activeLayout.sleekBorder !== false ? "rounded-xl" : "rounded-none"
            }`}
            id="create-widget-card-trigger"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 text-[#71717a] group-hover:text-[#3b82f6]" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#3b82f6] transition-colors">
              Build Dynamic Widget
            </span>
            <span className="text-[10px] text-[#71717a] mt-1 max-w-[180px] leading-relaxed">
              Configure backend request options, write schemas, or invoke AI suggestions to design visual containers.
            </span>
          </div>
        </div>

        {filteredWidgets.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No widgets mapped to this dashboard yet. Tap "Build Dynamic Widget" above or assign existing widgets to this page.
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showLibraryModal && dashboardFilter !== "all" && activeDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-scale-up my-8 text-left">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-[#121214]">
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Add Widgets to {activeDashboard.name}
                  </h3>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Link existing workspace widgets or search our pool of templates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer transition-colors"
                title="Close Library"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Library Statistics */}
            <div className="p-4 bg-[#121214]/50 border-b border-zinc-800 flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                  placeholder="Search available widgets by title or type..."
                />
              </div>
              <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2 shrink-0 bg-[#09090b] px-3 py-1.5 rounded border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                Total Library pool: {widgets.length} items
              </div>
            </div>

            {/* Widget Items Grid */}
            <div className="p-6 max-h-[420px] overflow-y-auto space-y-4">
              {(() => {
                const queryFiltered = widgets.filter(w => 
                  w.name.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                  w.type.toLowerCase().includes(librarySearchQuery.toLowerCase())
                );

                if (queryFiltered.length === 0) {
                  return (
                    <div className="text-center py-10 text-zinc-500 text-xs">
                      No matching widgets found in your workspace library.
                    </div>
                  );
                }

                // Split widgets into Linked and Unlinked for clear layout separation
                const linkedWidgets = queryFiltered.filter(w => w.assignedDashboards?.includes(dashboardFilter));
                const unlinkedWidgets = queryFiltered.filter(w => !w.assignedDashboards?.includes(dashboardFilter));

                return (
                  <div className="space-y-6">
                    {/* CURRENTLY LINKED SECTION */}
                    {linkedWidgets.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                          Linked to this Dashboard ({linkedWidgets.length})
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {linkedWidgets.map(widget => (
                            <div 
                              key={widget.id}
                              className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg hover:border-emerald-500/30 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                  {widget.type}
                                </span>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{widget.name}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono truncate block">{widget.apiEndpoint || "Direct Data Inflow"}</span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => toggleWidgetLink(widget.id, dashboardFilter)}
                                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-rose-950/40 text-white hover:text-rose-400 border border-transparent hover:border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer group"
                              >
                                <CheckCircle className="w-3.5 h-3.5 block group-hover:hidden" />
                                <Unlink className="w-3.5 h-3.5 hidden group-hover:block" />
                                <span className="block group-hover:hidden">Linked</span>
                                <span className="hidden group-hover:block">Unlink</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* UNLINKED / AVAILABLE SECTION */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Available to Add ({unlinkedWidgets.length})
                      </span>
                      {unlinkedWidgets.length === 0 ? (
                        <div className="text-zinc-500 text-xs italic p-3 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-lg text-center">
                          All library widgets are already linked to this dashboard layout.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {unlinkedWidgets.map(widget => (
                            <div 
                              key={widget.id}
                              className="flex items-center justify-between p-3.5 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-zinc-700/80 hover:bg-zinc-900/10 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                  {widget.type}
                                </span>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{widget.name}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono truncate block">{widget.apiEndpoint || "Direct Data Inflow"}</span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => toggleWidgetLink(widget.id, dashboardFilter)}
                                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-[#3b82f6] text-zinc-300 hover:text-white border border-zinc-700 hover:border-transparent text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                                Link Widget
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-[#121214] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <span className="text-zinc-500">
                Linked widgets adapt in real-time to your dashboard theme and column layout presets.
              </span>
              <button
                onClick={() => {
                  setShowLibraryModal(false);
                  handleOpenNewBuilder();
                }}
                className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create New Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Builder Dialog */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="px-6 py-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ToyBrick className="w-4.5 h-4.5 text-[#3b82f6]" />
                {cloneSourceId ? `Modify widget: ${newWidgetName}` : "Interactive SDK Widget Builder"}
              </h3>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-[#71717a] hover:text-white text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-[#27272a] bg-[#0c0c0e]">
              <button
                type="button"
                onClick={() => setActiveTab("api")}
                className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === "api"
                    ? "border-[#3b82f6] text-[#3b82f6] bg-[#18181b]/20"
                    : "border-transparent text-[#71717a] hover:text-white"
                }`}
              >
                1. Connection & AI Assist
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mapping")}
                className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === "mapping"
                    ? "border-[#3b82f6] text-[#3b82f6] bg-[#18181b]/20"
                    : "border-transparent text-[#71717a] hover:text-white"
                }`}
              >
                2. Visual & Schema
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-[#3b82f6] text-[#3b82f6] bg-[#18181b]/20"
                    : "border-transparent text-[#71717a] hover:text-white"
                }`}
              >
                3. Live Interactive Preview
              </button>
            </div>

            <form onSubmit={handleSaveWidget} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Tab 1 content: API Connection & AI Assist */}
              {activeTab === "api" && (
                <div className="space-y-5">
                  {/* AI Assistance card */}
                  <div className="bg-[#1e1b4b]/10 border border-blue-500/20 rounded-lg p-4 space-y-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                      <Sparkles className="w-4 h-4 fill-current text-[#3b82f6]" />
                      <span>AI ASSISTANT ARCHITECT</span>
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed">
                      Enter the analytic goal or API purpose below. Our server-side Gemini model will dynamically decide the ideal visual layout, configure parameters, and compile a compliant schema.
                    </p>
                    <textarea
                      value={widgetGoal}
                      onChange={(e) => setWidgetGoal(e.target.value)}
                      placeholder="e.g. Visualize country-level user signup percentages to find top performing markets..."
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] h-16 resize-none"
                    />
                    <div className="flex justify-between items-center gap-4">
                      {isGenerating ? (
                        <span className="text-[11px] text-[#3b82f6] font-mono flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Gemini composing layout architecture...
                        </span>
                      ) : (
                        <div />
                      )}
                      <button
                        type="button"
                        disabled={isGenerating || !widgetGoal.trim()}
                        onClick={handleAISuggest}
                        className="bg-[#3b82f6] hover:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI Auto-Suggest Layout
                      </button>
                    </div>
                  </div>

                  {aiExplanation && (
                    <div className="p-3 bg-zinc-900 border border-[#27272a] rounded-lg">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                        Architect Choice Explanation:
                      </span>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{aiExplanation}</p>
                    </div>
                  )}

                  {/* REST API Pipeline Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-[#27272a] pb-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#3b82f6]" />
                      REST Pipeline Parameters
                    </h4>

                    <div>
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                        Widget Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newWidgetName}
                        onChange={(e) => setNewWidgetName(e.target.value)}
                        placeholder="e.g., Regional Signups Distribution"
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                          HTTP Method
                        </label>
                        <select
                          value={apiMethod}
                          onChange={(e) => setApiMethod(e.target.value)}
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                          API Endpoint Destination
                        </label>
                        <input
                          type="text"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          placeholder="e.g. /api/v1/metrics/countries"
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] font-mono"
                        />
                      </div>
                    </div>

                    {/* Dynamic HTTP Headers */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                          Custom HTTP Headers
                        </label>
                        <button
                          type="button"
                          onClick={addHeader}
                          className="text-[10px] text-[#3b82f6] hover:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Header
                        </button>
                      </div>
                      
                      {headers.length === 0 ? (
                        <div className="p-3 bg-zinc-900/50 border border-dashed border-[#27272a] rounded-lg text-center text-[10px] text-[#71717a]">
                          No custom HTTP headers specified.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {headers.map((hdr, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Key (e.g. X-API-Key)"
                                value={hdr.key}
                                onChange={(e) => updateHeader(idx, "key", e.target.value)}
                                className="flex-1 bg-[#18181b] border border-[#27272a] rounded py-1 px-2 text-xs text-white font-mono"
                              />
                              <input
                                type="text"
                                placeholder="Value"
                                value={hdr.value}
                                onChange={(e) => updateHeader(idx, "value", e.target.value)}
                                className="flex-1 bg-[#18181b] border border-[#27272a] rounded py-1 px-2 text-xs text-white font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => removeHeader(idx)}
                                className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* POST request body payload input */}
                    {(apiMethod === "POST" || apiMethod === "PUT") && (
                      <div>
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                          Request JSON Payload Body
                        </label>
                        <textarea
                          value={requestPayload}
                          onChange={(e) => setRequestPayload(e.target.value)}
                          placeholder={`{\n  "segment": "global",\n  "aggregation": "daily"\n}`}
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 text-xs text-white font-mono h-20 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2 content: Visual Mapping & Schema */}
              {activeTab === "mapping" && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-[#27272a] pb-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#3b82f6]" />
                    Visual Mapping Definitions
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                        Visualization Output component
                      </label>
                      <select
                        value={newWidgetType}
                        onChange={(e) => setNewWidgetType(e.target.value as Widget["type"])}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      >
                        <option value="line">Line Chart (Temporal Cycles)</option>
                        <option value="bar">Bar Chart (Segment Comparisons)</option>
                        <option value="donut">Donut Chart (Share Allocations)</option>
                        <option value="kpi">KPI Summary Metric (Highlight Indicators)</option>
                        <option value="table">Tabular Grid (Raw Audits)</option>
                        <option value="map">Map Progress Bars (Geographical)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                        Default Ingestion Source Label
                      </label>
                      <select
                        value={newWidgetDS}
                        onChange={(e) => setNewWidgetDS(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      >
                        <option value="REST API Pipeline">REST API Pipeline</option>
                        <option value="Sales Database">Sales Database (SQL)</option>
                        <option value="CRM Database">HubSpot CRM Inflow</option>
                        <option value="Stripe Webhook">Stripe Live Stream</option>
                        <option value="Custom Schema Upload">Converted Schema Ingestion</option>
                      </select>
                    </div>
                  </div>

                  {/* Dashboard checkboxes */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                      Dashboard Assignment configuration
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={assignedDashboards.includes("all")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedDashboards(["all"]);
                            } else {
                              setAssignedDashboards([]);
                            }
                          }}
                          className="rounded border-[#27272a] text-[#3b82f6] focus:ring-0"
                        />
                        <span className="font-semibold text-[#3b82f6]">All Dashboards</span>
                      </label>
                      {storedDashboards.map((dash) => (
                        <label key={dash.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            disabled={assignedDashboards.includes("all")}
                            checked={assignedDashboards.includes("all") || assignedDashboards.includes(dash.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedDashboards([...assignedDashboards.filter(id => id !== "all"), dash.id]);
                              } else {
                                setAssignedDashboards(assignedDashboards.filter(id => id !== dash.id));
                              }
                            }}
                            className="rounded border-[#27272a] text-[#3b82f6] focus:ring-0"
                          />
                          <span>{dash.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* JSON fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                          Expected Response Schema
                        </label>
                        <span className="text-[9px] text-zinc-500 font-mono">Informational</span>
                      </div>
                      <textarea
                        value={responseSchema}
                        onChange={(e) => setResponseSchema(e.target.value)}
                        placeholder={`{\n  "type": "array",\n  "items": {\n    "name": "string",\n    "value": "number"\n  }\n}`}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 text-xs text-zinc-300 font-mono h-40 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                          Sample Response Mock Payload
                        </label>
                        <span className="text-[9px] text-zinc-500 font-mono">Pre-populate Preview</span>
                      </div>
                      <textarea
                        value={mockData}
                        onChange={(e) => setMockData(e.target.value)}
                        placeholder={`[\n  { "name": "A", "value": 100 },\n  { "name": "B", "value": 120 }\n]`}
                        className={`w-full bg-[#18181b] border rounded-lg p-2.5 text-xs font-mono h-40 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] ${
                          jsonError ? "border-rose-500 text-rose-300" : "border-[#27272a] text-zinc-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3 content: Live Interactive Preview */}
              {activeTab === "preview" && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-[#27272a] pb-1.5">
                    <FileJson className="w-3.5 h-3.5 text-[#3b82f6]" />
                    Compiled Live Render Validation
                  </h4>

                  {jsonError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Malformed Mock JSON payload:</span>
                        <span className="font-mono text-[10px]">{jsonError}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 bg-zinc-950 border border-[#27272a] rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-[#1e1b4b] text-[#3b82f6] px-2.5 py-0.5 rounded uppercase font-bold">
                          {newWidgetType} Preview
                        </span>
                        {previewParsedData ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Ingestion structure OK
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500">Provide mock payload on Step 2 to parse</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#09090b] border border-[#27272a]/50 p-4 rounded-lg min-h-[180px] flex flex-col justify-center">
                      {previewParsedData ? (
                        renderWidgetVisuals({
                          id: "preview-temp",
                          name: newWidgetName || "My Temporary Ingestion Live Preview",
                          type: newWidgetType,
                          dataSource: newWidgetDS,
                          queryType: `${apiMethod} ${apiEndpoint}`,
                          data: previewParsedData,
                          updatedAt: "Live Ingestion Inflow"
                        })
                      ) : (
                        <div className="text-center text-xs text-[#71717a] space-y-2">
                          <Sliders className="w-7 h-7 mx-auto text-[#27272a]" />
                          <p>Waiting for sample JSON mock payload definitions.</p>
                          <p className="text-[10px] max-w-xs mx-auto">Click back to Step 2 or prompt the AI Architect at Step 1 to auto-inject schemas.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-[#27272a] rounded-lg space-y-2 text-xs">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Endpoint Mapping Check:
                    </span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-zinc-300">
                      <div>Method: <span className="text-emerald-400 font-bold">{apiMethod}</span></div>
                      <div className="col-span-2 truncate">Endpoint: <span className="text-zinc-400">{apiEndpoint || "Direct payload ingestion"}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className="flex justify-between items-center pt-4 border-t border-[#27272a]">
                <div className="flex items-center gap-2">
                  {activeTab !== "api" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "preview") setActiveTab("mapping");
                        else if (activeTab === "mapping") setActiveTab("api");
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#27272a] text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBuilder(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#71717a] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {activeTab !== "preview" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "api") setActiveTab("mapping");
                        else if (activeTab === "mapping") setActiveTab("preview");
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer border border-[#27272a]"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!!jsonError}
                      className="bg-[#3b82f6] hover:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      Compile & Save Widget
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
