import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectQuery } from "@/store/api/projectsApi";
import {
  useGetDashboardQuery,
  useReplaceDashboardTilesMutation,
  useUpdateDashboardMutation,
} from "@/store/api/dashboardsApi";
import { useGetWidgetsQuery } from "@/store/api/widgetsApi";
import { getErrorMessage } from "@/lib/errors";
import { deriveLiveSource } from "@/lib/liveData";
import type { DashboardTile, Widget } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TYPE_COLOR } from "@/components/widgets/widgetTypeMeta";
import { DashboardTileCard } from "@/components/dashboard-canvas/DashboardTileCard";
import { AddWidgetDialog } from "@/components/dashboard-canvas/AddWidgetDialog";
import { PublishDialog } from "@/components/dashboard-canvas/PublishDialog";

export default function DashboardCanvasPage() {
  const { projectId, dashboardId } = useParams<{ projectId: string; dashboardId: string }>();
  const { toast } = useAuth();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError,
  } = useGetDashboardQuery(
    { projectId: projectId ?? "", dashboardId: dashboardId ?? "" },
    { skip: !projectId || !dashboardId },
  );
  const { data: allWidgets } = useGetWidgetsQuery(projectId ?? "", { skip: !projectId });
  const [replaceTiles, { isLoading: savingTiles }] = useReplaceDashboardTilesMutation();
  const [updateDashboard, { isLoading: updatingDashboard }] = useUpdateDashboardMutation();

  const [layout, setLayout] = React.useState<DashboardTile[]>([]);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showPublish, setShowPublish] = React.useState(false);
  const [viewerFilters, setViewerFilters] = React.useState(true);
  const [branding, setBranding] = React.useState(true);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    if (dashboard) setLayout(dashboard.layout);
  }, [dashboard]);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const persistLayout = React.useCallback(
    async (next: DashboardTile[]) => {
      try {
        await replaceTiles({
          projectId: projectId ?? "",
          dashboardId: dashboardId ?? "",
          tiles: next.map((t) => ({ widgetId: t.id, colSpan: t.colSpan, rowSpan: t.rowSpan })),
        }).unwrap();
        setLastSavedAt(Date.now());
      } catch {
        toast("Couldn't save the layout — try again", "error");
      }
    },
    [replaceTiles, toast, projectId, dashboardId],
  );

  if (!projectId || !dashboardId) return null;

  if (projectLoading || dashboardLoading) {
    return (
      <div className="px-11 py-9">
        <div className="h-6 w-40 animate-pulse rounded bg-bg-2" />
      </div>
    );
  }

  if (isError || !project || !dashboard) {
    return (
      <div className="px-11 py-9">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Dashboard not found, or you don't have access to it.
        </div>
      </div>
    );
  }

  const widgetMap = new Map((allWidgets ?? []).map((w) => [w.id, w]));

  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return;
    const next = [...layout];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setLayout(next);
    setDragIndex(null);
    void persistLayout(next);
  };

  const cycleSpan = (i: number) => {
    const next = [...layout];
    const cur = next[i].colSpan;
    next[i] = { ...next[i], colSpan: cur === 1 ? 2 : cur === 2 ? 4 : 1 };
    setLayout(next);
    void persistLayout(next);
  };

  const cycleRow = (i: number) => {
    const next = [...layout];
    next[i] = { ...next[i], rowSpan: next[i].rowSpan === 1 ? 2 : 1 };
    setLayout(next);
    void persistLayout(next);
  };

  const removeTile = (i: number) => {
    const next = layout.filter((_, idx) => idx !== i);
    setLayout(next);
    void persistLayout(next);
    toast("Widget removed from dashboard", "info");
  };

  const addWidget = (w: Widget) => {
    const next = [...layout, { id: w.id, colSpan: 2, rowSpan: 1 }];
    setLayout(next);
    void persistLayout(next);
    setShowAdd(false);
    toast("Widget added", "success");
  };

  const applyFilter = () => toast("Filters applied to all widgets", "info");

  const isPublished = dashboard.status === "published";
  const publicUrl = `${window.location.origin}/d/${dashboard.slug}`;
  const embedSnippet = `<iframe src="${publicUrl}/embed" width="100%" height="600" frameborder="0"></iframe>`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(publicUrl).catch(() => {});
    toast("URL copied to clipboard", "success");
  };

  const togglePublishState = async () => {
    const nowPublished = dashboard.status !== "published";
    try {
      await updateDashboard({
        projectId: projectId ?? "",
        dashboardId: dashboardId ?? "",
        input: { status: nowPublished ? "published" : "draft" },
      }).unwrap();
      toast(nowPublished ? "Dashboard published" : "Dashboard unpublished", "success");
      setShowPublish(false);
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't update the dashboard"), "error");
    }
  };

  const setSharePassword = async (password: string) => {
    try {
      await updateDashboard({
        projectId: projectId ?? "",
        dashboardId: dashboardId ?? "",
        input: { sharePassword: password },
      }).unwrap();
      toast("Password set", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't set the password"), "error");
    }
  };

  const removeSharePassword = async () => {
    try {
      await updateDashboard({
        projectId: projectId ?? "",
        dashboardId: dashboardId ?? "",
        input: { sharePassword: null },
      }).unwrap();
      toast("Password removed", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't remove the password"), "error");
    }
  };

  const saveLabel = savingTiles
    ? "Saving…"
    : lastSavedAt
      ? `Saved ${Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000))}s ago`
      : "";

  const usedIds = new Set(layout.map((l) => l.id));
  const availableWidgets = (allWidgets ?? []).filter((w) => !usedIds.has(w.id));

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
            <Badge variant={isPublished ? "success" : "neutral"}>{dashboard.status}</Badge>
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
                  liveSource={deriveLiveSource(widgetMap.get(tile.id)?.resource, w.type)}
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
        hasSharePassword={dashboard.has_share_password}
        updatingPassword={updatingDashboard}
        publishing={updatingDashboard}
        onToggleViewerFilters={() => setViewerFilters((v) => !v)}
        onToggleBranding={() => setBranding((v) => !v)}
        onCopyUrl={copyUrl}
        onKeepDraft={() => setShowPublish(false)}
        onTogglePublishState={togglePublishState}
        onSetSharePassword={setSharePassword}
        onRemoveSharePassword={removeSharePassword}
      />
    </div>
  );
}
