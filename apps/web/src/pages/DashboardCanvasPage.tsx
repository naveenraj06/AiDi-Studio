import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { DashboardTile, Widget } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TYPE_COLOR } from "@/components/widgets/widgetTypeMeta";
import { DashboardTileCard } from "@/components/dashboard-canvas/DashboardTileCard";
import { AddWidgetDialog } from "@/components/dashboard-canvas/AddWidgetDialog";
import { PublishDialog } from "@/components/dashboard-canvas/PublishDialog";

export default function DashboardCanvasPage() {
  const { projectId, dashboardId } = useParams<{ projectId: string; dashboardId: string }>();
  const { projects, dashboardsByProject, widgetsByProject, actions, toast } = useApp();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const dashboards = (projectId && dashboardsByProject[projectId]) || [];
  const dashboard = dashboards.find((d) => d.id === dashboardId);
  const allWidgets = (projectId && widgetsByProject[projectId]) || [];

  const [layout, setLayout] = React.useState<DashboardTile[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState(Date.now());
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showPublish, setShowPublish] = React.useState(false);
  const [viewerFilters, setViewerFilters] = React.useState(true);
  const [branding, setBranding] = React.useState(true);
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    setLayout((dashboard?.widgetIds || []).map((id) => ({ id, colSpan: 2, rowSpan: 1 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const markDirty = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setLastSaved(Date.now());
    }, 700);
  };

  if (!project || !dashboard || !projectId || !dashboardId) return null;

  const widgetMap = new Map(allWidgets.map((w) => [w.id, w]));

  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return;
    setLayout((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
    markDirty();
  };

  const cycleSpan = (i: number) => {
    setLayout((prev) => {
      const next = [...prev];
      const cur = next[i].colSpan;
      next[i] = { ...next[i], colSpan: cur === 1 ? 2 : cur === 2 ? 4 : 1 };
      return next;
    });
    markDirty();
  };

  const cycleRow = (i: number) => {
    setLayout((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], rowSpan: next[i].rowSpan === 1 ? 2 : 1 };
      return next;
    });
    markDirty();
  };

  const removeTile = (i: number) => {
    setLayout((prev) => prev.filter((_, idx) => idx !== i));
    markDirty();
    toast("Widget removed from dashboard", "info");
  };

  const addWidget = (w: Widget) => {
    setLayout((prev) => [...prev, { id: w.id, colSpan: 2, rowSpan: 1 }]);
    setShowAdd(false);
    markDirty();
    toast("Widget added", "success");
  };

  const applyFilter = () => toast("Filters applied to all widgets", "info");

  const isPublished = dashboard.status === "published";
  const publicUrl = `https://aidistudio.app/d/${dashboard.slug}`;
  const embedSnippet = `<iframe src="${publicUrl}/embed" width="100%" height="600" frameborder="0"></iframe>`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(publicUrl).catch(() => {});
    toast("URL copied to clipboard", "success");
  };

  const togglePublishState = () => {
    const nowPublished = dashboard.status !== "published";
    actions.setDashboards(projectId, (list) =>
      list.map((d) => (d.id === dashboardId ? { ...d, status: nowPublished ? "published" : "draft" } : d)),
    );
    toast(nowPublished ? "Dashboard published" : "Dashboard unpublished", "success");
    setShowPublish(false);
  };

  const secondsAgo = Math.max(0, Math.round((Date.now() - lastSaved) / 1000));
  const saveLabel = saving ? "Saving…" : `Saved ${secondsAgo}s ago`;

  const usedIds = new Set(layout.map((l) => l.id));
  const availableWidgets = allWidgets.filter((w) => !usedIds.has(w.id));

  return (
    <div className="flex h-full flex-col">
      <div className="px-11 pt-[22px]">
        <div
          onClick={() => navigate(`/projects/${projectId}/dashboards`)}
          className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-[12px] text-ink-3"
        >
          ← Dashboards
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-display text-[22px] font-bold text-ink-1">{dashboard.name}</div>
            <Badge
              bg={isPublished ? "#0e2f24" : "var(--color-border-strong)"}
              color={isPublished ? "var(--color-brand-green)" : "var(--color-ink-2)"}
            >
              {dashboard.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="text-[11px] text-ink-3">{saveLabel}</div>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
              + Add widget
            </Button>
            <Button size="sm" onClick={() => setShowPublish(true)}>
              {isPublished ? "Manage publish" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <select
            onChange={applyFilter}
            defaultValue="Last 30 days"
            className="rounded-lg border border-border-strong bg-bg-1 px-3 py-2 text-[12px] text-ink-1 outline-none"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Year to date</option>
          </select>
          <select
            onChange={applyFilter}
            defaultValue="All regions"
            className="rounded-lg border border-border-strong bg-bg-1 px-3 py-2 text-[12px] text-ink-1 outline-none"
          >
            <option>All regions</option>
            <option>US-West</option>
            <option>US-East</option>
            <option>EU-Central</option>
            <option>APAC</option>
          </select>
          <div className="text-[11px] text-ink-3">Global filters — applied to every widget below</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-11 pb-11">
        {layout.length > 0 ? (
          <div className="grid grid-cols-4 gap-4" style={{ gridAutoRows: "170px" }}>
            {layout.map((tile, i) => {
              const w = widgetMap.get(tile.id) || { name: "Unknown widget", type: "table" as const };
              return (
                <DashboardTileCard
                  key={tile.id + i}
                  name={w.name}
                  type={w.type}
                  color={TYPE_COLOR[w.type] || "#8b5cf6"}
                  colSpan={tile.colSpan}
                  rowSpan={tile.rowSpan}
                  onDragStart={() => setDragIndex(i)}
                  onDrop={() => handleDrop(i)}
                  onCycleSpan={() => cycleSpan(i)}
                  onCycleRow={() => cycleRow(i)}
                  onRemove={() => removeTile(i)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border-strong p-[60px] text-center text-ink-3">
            <div className="mb-2.5 text-[14px]">No widgets on this dashboard yet</div>
            <Button size="sm" onClick={() => setShowAdd(true)} className="mt-1.5">
              + Add widget
            </Button>
          </div>
        )}
      </div>

      <AddWidgetDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        availableWidgets={availableWidgets}
        onCreateNew={() => navigate(`/projects/${projectId}/widgets/new`)}
        onAdd={addWidget}
      />

      <PublishDialog
        open={showPublish}
        onOpenChange={setShowPublish}
        isPublished={isPublished}
        publicUrl={publicUrl}
        embedSnippet={embedSnippet}
        viewerFilters={viewerFilters}
        branding={branding}
        onToggleViewerFilters={() => setViewerFilters((v) => !v)}
        onToggleBranding={() => setBranding((v) => !v)}
        onCopyUrl={copyUrl}
        onKeepDraft={() => setShowPublish(false)}
        onTogglePublishState={togglePublishState}
      />
    </div>
  );
}
