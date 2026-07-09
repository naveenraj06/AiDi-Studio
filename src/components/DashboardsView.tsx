import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  Plus,
  Filter,
  Globe,
  EyeOff,
  MoreHorizontal,
  MoreVertical,
  Calendar,
  Activity,
  ArrowLeft,
  Archive,
  ArchiveRestore,
  Edit,
  Palette,
  Sliders,
  Grid,
  List,
  ChevronRight,
  Sparkles,
  Check,
  CheckSquare,
  FileText,
  MousePointerClick,
  Trash2,
  Copy
} from "lucide-react";
import { Dashboard } from "../types";

interface DashboardsViewProps {
  projectId: string;
  onBackToProjects: () => void;
  onNavigateToWidgets: (dashboardId: string) => void;
}

// Accent Colors Configuration
const ACCENT_COLORS = [
  { id: "indigo", name: "Cyber Indigo", hex: "#4f46e5", bgClass: "bg-indigo-500", textClass: "text-indigo-400" },
  { id: "pink", name: "Retro Pink", hex: "#ec4899", bgClass: "bg-pink-500", textClass: "text-pink-400" },
  { id: "emerald", name: "Mint Emerald", hex: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-400" },
  { id: "amber", name: "Golden Amber", hex: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-400" },
  { id: "cyan", name: "Neon Cyan", hex: "#06b6d4", bgClass: "bg-cyan-500", textClass: "text-cyan-400" },
  { id: "violet", name: "Royal Violet", hex: "#8b5cf6", bgClass: "bg-violet-500", textClass: "text-violet-400" },
  { id: "rose", name: "Velvet Rose", hex: "#f43f5e", bgClass: "bg-rose-500", textClass: "text-rose-400" },
];

// Background Style Configurations
const BACKGROUND_STYLES = [
  { id: "dark-slate", name: "Slate Nebula", class: "bg-[#0c0d12]", previewClass: "bg-gradient-to-br from-[#0c0d12] to-[#1e1b4b]" },
  { id: "charcoal", name: "Absolute Charcoal", class: "bg-[#09090b]", previewClass: "bg-[#09090b]" },
  { id: "deep-blue", name: "Abyssal Space", class: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]", previewClass: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]" },
  { id: "emerald-cave", name: "Emerald Depths", class: "bg-gradient-to-br from-[#021f18] via-[#064e3b] to-[#021f18]", previewClass: "bg-gradient-to-br from-[#021f18] to-[#064e3b]" },
  { id: "royal-violet", name: "Cyberpunk Violet", class: "bg-gradient-to-br from-[#12072b] via-[#311042] to-[#11052c]", previewClass: "bg-gradient-to-br from-[#12072b] to-[#311042]" },
  { id: "nordic-monochrome", name: "Polar Night", class: "bg-[#111217]", previewClass: "bg-[#111217]" },
];

// Card Styles Configuration
const CARD_STYLES = [
  { id: "glassmorphism", name: "Glassmorphic blur", class: "bg-white/[0.02] backdrop-blur-md border border-white/10 hover:bg-white/[0.04]" },
  { id: "minimalist", name: "Minimal stark line", class: "bg-transparent border border-zinc-800 hover:border-zinc-700" },
  { id: "sleek-border", name: "Adaptive glow", class: "bg-[#121214] border border-zinc-800/80 hover:border-[#3b82f6]/40" },
  { id: "neon-accent", name: "Glowing top ledge", class: "bg-[#141416] border-x border-b border-zinc-800/80 border-t-2" },
  { id: "classic-dark", name: "Elevated solid carbon", class: "bg-[#16161a] border border-zinc-800 hover:bg-[#1d1d22]" },
];

// Fonts Styles Configuration
const FONTS_STYLES = [
  { id: "sans", name: "Inter (Modern clean)", class: "font-sans" },
  { id: "grotesk", name: "Space Grotesk (Tech/Wide)", class: "font-sans tracking-tight font-medium" },
  { id: "mono", name: "JetBrains Mono (Developer)", class: "font-mono" },
  { id: "serif", name: "Editorial Georgia (Classic)", class: "font-serif" },
];

export default function DashboardsView({ projectId, onBackToProjects, onNavigateToWidgets }: DashboardsViewProps) {
  // Read dashboards from localStorage, or populate with gorgeous default themed assets
  const [dashboards, setDashboards] = useState<Dashboard[]>(() => {
    const saved = localStorage.getItem(`dashboards_${projectId}`);
    let list: Dashboard[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    if (!list.length) {
      list = [
        {
          id: "executive",
          name: "Executive Overview",
          status: "Live",
          widgetsCount: 4,
          visibility: "Public",
          updatedAt: "Updated 2 hours ago",
          isArchived: false,
          theme: {
            primaryColor: "indigo",
            bgStyle: "deep-blue",
            cardStyle: "glassmorphism",
            fontStyle: "grotesk"
          },
          layout: {
            columns: 3,
            spacing: "cozy",
            sleekBorder: true
          }
        },
        {
          id: "marketing",
          name: "Marketing Overview",
          status: "Draft",
          widgetsCount: 3,
          visibility: "Private",
          updatedAt: "Updated 1 day ago",
          isArchived: false,
          theme: {
            primaryColor: "pink",
            bgStyle: "royal-violet",
            cardStyle: "neon-accent",
            fontStyle: "grotesk"
          },
          layout: {
            columns: 2,
            spacing: "spacious",
            sleekBorder: true
          }
        },
        {
          id: "sales",
          name: "Sales Performance",
          status: "Live",
          widgetsCount: 4,
          visibility: "Public",
          updatedAt: "Updated 2 days ago",
          isArchived: false,
          theme: {
            primaryColor: "emerald",
            bgStyle: "emerald-cave",
            cardStyle: "sleek-border",
            fontStyle: "sans"
          },
          layout: {
            columns: 3,
            spacing: "compact",
            sleekBorder: true
          }
        },
        {
          id: "customer",
          name: "Customer Insights",
          status: "Draft",
          widgetsCount: 2,
          visibility: "Private",
          updatedAt: "Updated 3 days ago",
          isArchived: false,
          theme: {
            primaryColor: "amber",
            bgStyle: "charcoal",
            cardStyle: "minimalist",
            fontStyle: "serif"
          },
          layout: {
            columns: 2,
            spacing: "cozy",
            sleekBorder: false
          }
        },
        {
          id: "product",
          name: "Product Analytics",
          status: "Live",
          widgetsCount: 3,
          visibility: "Public",
          updatedAt: "Updated 5 days ago",
          isArchived: false,
          theme: {
            primaryColor: "cyan",
            bgStyle: "nordic-monochrome",
            cardStyle: "classic-dark",
            fontStyle: "mono"
          },
          layout: {
            columns: 3,
            spacing: "compact",
            sleekBorder: true
          }
        },
      ];
    }

    try {
      const savedWidgets = localStorage.getItem("widgets_store");
      if (savedWidgets) {
        const widgets = JSON.parse(savedWidgets);
        list = list.map((dash) => {
          const count = widgets.filter((w: any) => w.assignedDashboards?.includes(dash.id) || w.assignedDashboards?.includes("all")).length;
          return { ...dash, widgetsCount: count };
        });
      }
    } catch (e) {}

    return list;
  });

  // Persist dashboards when state changes
  useEffect(() => {
    localStorage.setItem(`dashboards_${projectId}`, JSON.stringify(dashboards));
    // Also store globally for other components to access shared list
    localStorage.setItem("dashboards_store", JSON.stringify(dashboards));
  }, [dashboards, projectId]);

  // Dynamically sync widget count on load
  useEffect(() => {
    try {
      const savedWidgets = localStorage.getItem("widgets_store");
      if (savedWidgets) {
        const widgets = JSON.parse(savedWidgets);
        setDashboards((prev) =>
          prev.map((dash) => {
            const count = widgets.filter((w: any) => w.assignedDashboards?.includes(dash.id) || w.assignedDashboards?.includes("all")).length;
            return { ...dash, widgetsCount: count };
          })
        );
      }
    } catch (e) {}
  }, [projectId]);

  // Filters & layout display mode
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Live" | "Draft" | "Archived">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Create/Edit/Customize modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [dashName, setDashName] = useState("");
  const [dashVis, setDashVis] = useState<"Public" | "Private">("Public");
  const [dashStatus, setDashStatus] = useState<"Live" | "Draft">("Draft");
  const [dashIsArchived, setDashIsArchived] = useState(false);

  // Dashboard Theme Settings State
  const [themePrimary, setThemePrimary] = useState("indigo");
  const [themeBg, setThemeBg] = useState("charcoal");
  const [themeCard, setThemeCard] = useState("sleek-border");
  const [themeFont, setThemeFont] = useState("sans");

  // Layout states
  const [layoutCols, setLayoutCols] = useState<1 | 2 | 3 | 4>(3);
  const [layoutSpacing, setLayoutSpacing] = useState<"compact" | "cozy" | "spacious">("cozy");
  const [layoutSleekBorder, setLayoutSleekBorder] = useState(true);

  // Handler to open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setDashName("");
    setDashVis("Public");
    setDashStatus("Draft");
    setDashIsArchived(false);
    setThemePrimary("indigo");
    setThemeBg("charcoal");
    setThemeCard("sleek-border");
    setThemeFont("sans");
    setLayoutCols(3);
    setLayoutSpacing("cozy");
    setLayoutSleekBorder(true);
    setShowConfigModal(true);
  };

  // Handler to open Edit & Theme Customizer Modal
  const handleOpenEdit = (dash: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(dash.id);
    setDashName(dash.name);
    setDashVis(dash.visibility);
    setDashStatus(dash.status);
    setDashIsArchived(!!dash.isArchived);

    // Load theme details if defined
    setThemePrimary(dash.theme?.primaryColor || "indigo");
    setThemeBg(dash.theme?.bgStyle || "charcoal");
    setThemeCard(dash.theme?.cardStyle || "sleek-border");
    setThemeFont(dash.theme?.fontStyle || "sans");

    // Load layout options if defined
    setLayoutCols((dash.layout?.columns as any) || 3);
    setLayoutSpacing(dash.layout?.spacing || "cozy");
    setLayoutSleekBorder(dash.layout?.sleekBorder !== false);

    setShowConfigModal(true);
  };

  // Save changes handler
  const handleSaveDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashName.trim()) {
      alert("Please provide a name for this dashboard.");
      return;
    }

    const currentTheme = {
      primaryColor: themePrimary,
      bgStyle: themeBg as any,
      cardStyle: themeCard as any,
      fontStyle: themeFont as any
    };

    const currentLayout = {
      columns: layoutCols,
      spacing: layoutSpacing,
      sleekBorder: layoutSleekBorder
    };

    if (editingId) {
      // Modifying existing dashboard
      setDashboards(
        dashboards.map((d) =>
          d.id === editingId
            ? {
                ...d,
                name: dashName,
                visibility: dashVis,
                status: dashStatus,
                isArchived: dashIsArchived,
                theme: currentTheme,
                layout: currentLayout,
                updatedAt: "Updated just now",
              }
            : d
        )
      );
    } else {
      // Creating brand new dashboard
      const generatedId = dashName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const finalId = dashboards.some((d) => d.id === generatedId)
        ? `${generatedId}-${Date.now().toString().slice(-4)}`
        : generatedId;

      const newDash: Dashboard = {
        id: finalId,
        name: dashName,
        status: dashStatus,
        widgetsCount: 0,
        visibility: dashVis,
        isArchived: dashIsArchived,
        updatedAt: "Created just now",
        theme: currentTheme,
        layout: currentLayout,
      };

      setDashboards([newDash, ...dashboards]);
    }

    setShowConfigModal(false);
  };

  // Archive / Restore dashboard quickly
  const handleToggleArchive = (dash: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    const newArchivedState = !dash.isArchived;
    setDashboards(
      dashboards.map((d) =>
        d.id === dash.id ? { ...d, isArchived: newArchivedState, updatedAt: "Updated just now" } : d
      )
    );
  };

  // Clone Dashboard with theme copy
  const handleCloneDashboard = (dash: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedId = `${dash.id}-copy-${Date.now().toString().slice(-3)}`;
    const clonedName = `Copy of ${dash.name}`;
    const clonedDash: Dashboard = {
      ...dash,
      id: clonedId,
      name: clonedName,
      updatedAt: "Cloned just now",
    };
    setDashboards([clonedDash, ...dashboards]);
  };

  // Delete dashboard completely
  const handleDeleteDashboard = (dashId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you absolutely sure you want to delete this dashboard? All widget references will persist but their assignment lists will be updated.")) {
      setDashboards(dashboards.filter((d) => d.id !== dashId));
    }
  };

  // Filter lists
  const filteredDashboards = dashboards.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter rules:
    // If filtering by "Archived", we show only archived items.
    // If filtering by "all", we show only active items (non-archived).
    // If filtering by "Live" / "Draft", we show active items with that specific status.
    if (statusFilter === "Archived") {
      return matchesSearch && d.isArchived === true;
    } else {
      // Standard view: hide all archived dashboards
      if (d.isArchived) return false;
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && d.status === statusFilter;
    }
  });

  // Helpers to get styling classes for Dashboard card previews
  const getAccentHex = (colorId?: string) => {
    const color = ACCENT_COLORS.find(c => c.id === colorId) || ACCENT_COLORS[0];
    return color.hex;
  };

  const getThemeFontFamily = (fontId?: string) => {
    const font = FONTS_STYLES.find(f => f.id === fontId) || FONTS_STYLES[0];
    return font.class;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back to Workspace */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBackToProjects}
          className="flex items-center gap-2 text-[#3b82f6] hover:text-blue-400 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          id="back-to-projects-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </button>

        {/* View mode buttons & layout helper */}
        <div className="flex bg-[#121214] border border-[#27272a] rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "grid" ? "bg-[#3b82f6] text-white" : "text-[#71717a] hover:text-white"
            }`}
            title="Display as Sleek Cards"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "table" ? "bg-[#3b82f6] text-white" : "text-[#71717a] hover:text-white"
            }`}
            title="Display as Detailed Table"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5.5 h-5.5 text-[#3b82f6]" />
            Sleek Dashboard Registry
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            Build specialized views. Configure distinct themes, columns, fonts, and privacy states per dashboard.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all self-start cursor-pointer shadow-lg shadow-blue-500/20"
          id="create-dashboard-btn"
        >
          <Plus className="w-4 h-4" />
          New Dashboard
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#09090b] border border-[#27272a] p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
            placeholder="Search dashboards by title or target audience..."
            id="dashboards-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#71717a] text-xs font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Registry Filter:
          </div>
          <div className="flex bg-[#18181b] border border-[#27272a] rounded-lg p-1">
            {(["all", "Live", "Draft", "Archived"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? filter === "Archived"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-[#3b82f6] text-white"
                    : "text-[#71717a] hover:text-white"
                }`}
              >
                {filter === "all" ? "Active" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid view (GORGEOUS customizable thumbnails with live theme cues) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboards.map((dash) => {
            const accentColorObj = ACCENT_COLORS.find(c => c.id === (dash.theme?.primaryColor || "indigo")) || ACCENT_COLORS[0];
            const bgObj = BACKGROUND_STYLES.find(b => b.id === (dash.theme?.bgStyle || "charcoal")) || BACKGROUND_STYLES[1];
            const cardObj = CARD_STYLES.find(c => c.id === (dash.theme?.cardStyle || "sleek-border")) || CARD_STYLES[2];
            const isGlass = dash.theme?.cardStyle === "glassmorphism";

            return (
              <div
                key={dash.id}
                onClick={() => onNavigateToWidgets(dash.id)}
                className={`group flex flex-col justify-between relative rounded-xl p-5 overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border ${
                  isGlass
                    ? "bg-white/[0.02] backdrop-blur-md border-white/10 hover:border-white/20"
                    : "bg-[#09090b] border-[#27272a] hover:border-zinc-700"
                }`}
                style={{
                  borderTopColor: dash.theme?.cardStyle === "neon-accent" ? accentColorObj.hex : undefined,
                  borderTopWidth: dash.theme?.cardStyle === "neon-accent" ? "3px" : undefined
                }}
              >
                {/* Visual Accent Ambient Glow */}
                <div
                  className="absolute -right-12 -top-12 w-24 h-24 rounded-full blur-2xl opacity-5 transition-opacity group-hover:opacity-15 pointer-events-none"
                  style={{ backgroundColor: accentColorObj.hex }}
                />

                {/* Dashboard Meta Content */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#71717a] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {dash.layout?.columns || 3} Cols
                      </span>
                      {/* Status indicator */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                          dash.status === "Live"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${dash.status === "Live" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {dash.status}
                      </span>
                    </div>

                    {/* Single Sleek Three-Dot Menu Button */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === dash.id ? null : dash.id);
                        }}
                        className={`p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer border ${
                          openMenuId === dash.id ? "bg-zinc-800 border-zinc-700 text-white" : "border-transparent"
                        }`}
                        title="Dashboard Operations"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown settings popover */}
                      {openMenuId === dash.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30 cursor-default" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          />
                          <div 
                            className="absolute right-0 mt-1.5 w-48 bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl py-1 z-40 animate-scale-up text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1.5 border-b border-zinc-900 mb-1">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dashboard Menu</p>
                            </div>
                            <button
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleOpenEdit(dash, e);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                            >
                              <Palette className="w-3.5 h-3.5 text-zinc-400" />
                              Customize Theme
                            </button>
                            <button
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleCloneDashboard(dash, e);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                            >
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              Clone Layout
                            </button>
                            <button
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleToggleArchive(dash, e);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                            >
                              {dash.isArchived ? (
                                <>
                                  <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                                  Restore Layout
                                </>
                              ) : (
                                <>
                                  <Archive className="w-3.5 h-3.5 text-zinc-400" />
                                  Archive Layout
                                </>
                              )}
                            </button>
                            <div className="border-t border-zinc-900 my-1" />
                            <button
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleDeleteDashboard(dash.id, e);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete Dashboard
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & custom font family */}
                  <h3
                    className={`text-base font-bold text-white group-hover:text-[#3b82f6] transition-colors leading-snug truncate ${getThemeFontFamily(dash.theme?.fontStyle)}`}
                    title={dash.name}
                  >
                    {dash.name}
                  </h3>
                  
                  {/* Visibility tag */}
                  <div className="flex items-center gap-1.5 text-xs text-[#71717a] mt-1.5 mb-4">
                    {dash.visibility === "Public" ? (
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span className="font-medium text-[11px] text-zinc-400">{dash.visibility} Preview</span>
                  </div>

                  {/* Sleek Theme Fingerprint row */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2 border-t border-b border-zinc-900 mb-5 text-[10px]">
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColorObj.hex }} />
                      <span className="text-zinc-400 font-medium">{accentColorObj.name}</span>
                    </div>
                    <span className="text-zinc-800 font-bold">•</span>
                    <span className="text-zinc-500 font-mono shrink-0">{bgObj.name}</span>
                    <span className="text-zinc-800 font-bold">•</span>
                    <span className="text-zinc-500 font-mono shrink-0 capitalize">{dash.layout?.spacing || "cozy"} Spacing</span>
                  </div>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-900 px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">{dash.widgetsCount} widgets loaded</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem("open_widget_library_for_dashboard", dash.id);
                      onNavigateToWidgets(dash.id);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#3b82f6]/10 hover:bg-[#3b82f6] border border-[#3b82f6]/20 hover:border-transparent text-[#3b82f6] hover:text-white rounded-md flex items-center gap-1 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 shrink-0"
                    title="Link Existing Widgets or Add New"
                  >
                    <Plus className="w-3 h-3 text-[#3b82f6] group-hover:text-white" style={{ color: "inherit" }} />
                    Add Widget
                  </button>
                </div>
              </div>
            );
          })}

          {/* Create Empty State Block */}
          <div
            onClick={handleOpenCreate}
            className="border-2 border-dashed border-[#27272a] hover:border-[#3b82f6]/30 bg-transparent rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-zinc-900/10 min-h-[240px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 text-[#71717a] group-hover:text-[#3b82f6]" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#3b82f6] transition-colors">
              Add New Analytics Canvas
            </span>
            <span className="text-[10px] text-[#71717a] mt-1 max-w-[180px] leading-relaxed">
              Design customized grid widths, map responsive layout spacing, and select neon accents.
            </span>
          </div>
        </div>
      ) : (
        /* Traditional detailed tabular view */
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#18181b] text-xs font-semibold text-[#71717a] uppercase tracking-widest">
                  <th className="px-6 py-4">Dashboard Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Theme Identity</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Widgets Count</th>
                  <th className="px-6 py-4 hidden md:table-cell">Visibility</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-sm text-zinc-300">
                {filteredDashboards.map((dash) => {
                  const accentColorObj = ACCENT_COLORS.find(c => c.id === (dash.theme?.primaryColor || "indigo")) || ACCENT_COLORS[0];
                  return (
                    <tr
                      key={dash.id}
                      onClick={() => onNavigateToWidgets(dash.id)}
                      className="hover:bg-[#18181b]/40 cursor-pointer group transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-white group-hover:text-[#3b82f6] transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded border flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${accentColorObj.hex}10`,
                              borderColor: `${accentColorObj.hex}30`,
                              color: accentColorObj.hex
                            }}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className={`block ${getThemeFontFamily(dash.theme?.fontStyle)}`}>
                              {dash.name}
                            </span>
                            {dash.isArchived && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono uppercase tracking-wider">
                                Archived
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border ${
                            dash.status === "Live"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <Activity className={`w-3.5 h-3.5 ${dash.status === "Live" ? "animate-pulse" : ""}`} />
                          {dash.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: accentColorObj.hex }}
                          />
                          <span className="text-xs text-zinc-400 capitalize">
                            {accentColorObj.name} ({dash.theme?.cardStyle || "Sleek"})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell font-mono text-xs text-[#71717a]">
                        {dash.widgetsCount} widgets
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="flex items-center gap-2 text-[#71717a]">
                          {dash.visibility === "Public" ? (
                            <>
                              <Globe className="w-4 h-4 text-zinc-500" />
                              Public
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-zinc-500" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-2 text-[#71717a] font-mono text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                          {dash.updatedAt}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              localStorage.setItem("open_widget_library_for_dashboard", dash.id);
                              onNavigateToWidgets(dash.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#3b82f6]/10 hover:bg-[#3b82f6] border border-[#3b82f6]/20 hover:border-transparent text-[#3b82f6] hover:text-white rounded-md flex items-center gap-1 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 shrink-0"
                            title="Link Existing Widgets or Add New"
                          >
                            <Plus className="w-3 h-3 text-[#3b82f6]" style={{ color: "inherit" }} />
                            Add Widget
                          </button>

                          {/* Table Menu button */}
                          <div className="relative shrink-0 text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === dash.id ? null : dash.id);
                              }}
                              className={`p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer border ${
                                openMenuId === dash.id ? "bg-zinc-800 border-zinc-700 text-white" : "border-transparent"
                              }`}
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {openMenuId === dash.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30 cursor-default" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                  }}
                                />
                                <div 
                                  className="absolute right-0 mt-1 w-48 bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl py-1 z-40 animate-scale-up"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      setOpenMenuId(null);
                                      handleOpenEdit(dash, e);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                  >
                                    <Palette className="w-3.5 h-3.5 text-zinc-400" />
                                    Customize Theme
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      setOpenMenuId(null);
                                      handleCloneDashboard(dash, e);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                    Clone Layout
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      setOpenMenuId(null);
                                      handleToggleArchive(dash, e);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                  >
                                    {dash.isArchived ? (
                                      <>
                                        <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                                        Restore Layout
                                      </>
                                    ) : (
                                      <>
                                        <Archive className="w-3.5 h-3.5 text-zinc-400" />
                                        Archive Layout
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-zinc-900 my-1" />
                                  <button
                                    onClick={(e) => {
                                      setOpenMenuId(null);
                                      handleDeleteDashboard(dash.id, e);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    Delete Dashboard
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDashboards.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#71717a]">
                      No dashboards found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE CONFIGURATION & THEME CUSTOMIZER MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="px-6 py-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4.5 h-4.5 text-[#3b82f6]" />
                {editingId ? `Customize: ${dashName}` : "Create Custom Canvas Architect"}
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#71717a] hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveDashboard} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: Standard ledger info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#27272a] pb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  1. Canonical Identifiers
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                    Dashboard Display Title
                  </label>
                  <input
                    type="text"
                    required
                    value={dashName}
                    onChange={(e) => setDashName(e.target.value)}
                    placeholder="e.g. Sales KPI Executive Performance Grid"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Access Visibility
                    </label>
                    <select
                      value={dashVis}
                      onChange={(e) => setDashVis(e.target.value as "Public" | "Private")}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                    >
                      <option value="Public">Public Access</option>
                      <option value="Private">Private Restrict</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Initial Deploy Status
                    </label>
                    <select
                      value={dashStatus}
                      onChange={(e) => setDashStatus(e.target.value as "Live" | "Draft")}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                    >
                      <option value="Draft">Draft Mode</option>
                      <option value="Live">Live Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Registry Archive
                    </label>
                    <div className="flex items-center gap-2 h-9">
                      <input
                        type="checkbox"
                        id="archive-chk"
                        checked={dashIsArchived}
                        onChange={(e) => setDashIsArchived(e.target.checked)}
                        className="rounded border-[#27272a] text-[#3b82f6] focus:ring-0 bg-[#18181b] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="archive-chk" className="text-xs text-zinc-300 select-none cursor-pointer">
                        Archive (Hide from public)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dynamic Theme Selection */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#27272a] pb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#3b82f6]" />
                  2. Tailwind Theme Design Customization
                </h4>

                {/* Primary Accent Color Grid Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                    Visual Accent Glow Color
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {ACCENT_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setThemePrimary(col.id)}
                        className={`py-1.5 px-2 rounded-md border text-[10px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          themePrimary === col.id
                            ? "bg-[#1e1b4b] border-[#3b82f6] text-white"
                            : "bg-[#18181b] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <span className="truncate">{col.name.split(" ")[1]}</span>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.bgClass}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background selection & Card selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Ambient Wallpaper Theme Background
                    </label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {BACKGROUND_STYLES.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setThemeBg(bg.id)}
                          className={`w-full p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            themeBg === bg.id
                              ? "bg-zinc-800 border-[#3b82f6] text-white"
                              : "bg-[#18181b] border-zinc-800/80 text-zinc-400 hover:bg-zinc-900"
                          }`}
                        >
                          <span>{bg.name}</span>
                          <div className={`w-10 h-4.5 rounded ${bg.previewClass} border border-white/10`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Layout Container Cards Style
                    </label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {CARD_STYLES.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setThemeCard(card.id)}
                          className={`w-full p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            themeCard === card.id
                              ? "bg-zinc-800 border-[#3b82f6] text-white"
                              : "bg-[#18181b] border-zinc-800/80 text-zinc-400 hover:bg-zinc-900"
                          }`}
                        >
                          <span className="truncate">{card.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono capitalize">{card.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font selections */}
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                    Design Typography Accent Pairing
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONTS_STYLES.map((fnt) => (
                      <button
                        key={fnt.id}
                        type="button"
                        onClick={() => setThemeFont(fnt.id)}
                        className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                          themeFont === fnt.id
                            ? "bg-[#1e1b4b] border-[#3b82f6] text-white"
                            : "bg-[#18181b] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <span className={`block font-bold text-[11px] ${fnt.class}`}>Aa Bb Gg</span>
                        <span className="block text-[9px] text-zinc-500 mt-1">{fnt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Visual Grid and spacing options */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#27272a] pb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  3. Layout Grid & Device Spacing (Adapts automatically)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Default Columns Width
                    </label>
                    <select
                      value={layoutCols}
                      onChange={(e) => setLayoutCols(Number(e.target.value) as any)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value={1}>1 Column (Full Ledger Width)</option>
                      <option value={2}>2 Columns (Wide Dual Layout)</option>
                      <option value={3}>3 Columns (Standard Bento Grid)</option>
                      <option value={4}>4 Columns (Dense Compact Matrix)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Element Spacing Gap
                    </label>
                    <select
                      value={layoutSpacing}
                      onChange={(e) => setLayoutSpacing(e.target.value as any)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="compact">Compact (Tighter Grid)</option>
                      <option value="cozy">Cozy Balanced (Ideal)</option>
                      <option value="spacious">Spacious (Open Air/Negative space)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                      Border Rounding Accent
                    </label>
                    <div className="flex items-center gap-2 h-9">
                      <input
                        type="checkbox"
                        id="sleekBorderCheck"
                        checked={layoutSleekBorder}
                        onChange={(e) => setLayoutSleekBorder(e.target.checked)}
                        className="rounded border-[#27272a] text-[#3b82f6] focus:ring-0 bg-[#18181b] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="sleekBorderCheck" className="text-xs text-zinc-300 select-none cursor-pointer">
                        Round corners & glow
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE & SUBMIT STRIP */}
              <div className="flex justify-between items-center pt-4 border-t border-[#27272a]">
                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Auto-persists to localStorage
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#71717a] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
