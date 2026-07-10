import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProject } from "@/hooks/useProjects";
import { useCreateDashboard, useDashboards, useDeleteDashboard } from "@/hooks/useDashboards";
import { useWidgets } from "@/hooks/useWidgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import { timeAgo } from "@/lib/timeAgo";
import type { Dashboard } from "@/types";

export default function DashboardsListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useApp();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: dashboards, isLoading, isError } = useDashboards(projectId);
  const { data: widgets } = useWidgets(projectId);
  const createDashboard = useCreateDashboard(projectId ?? "");
  const deleteDashboard = useDeleteDashboard(projectId ?? "");

  const widgetMap = React.useMemo(() => {
    const m: Record<string, NonNullable<typeof widgets>[number]> = {};
    (widgets ?? []).forEach((w) => (m[w.id] = w));
    return m;
  }, [widgets]);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Dashboard | null>(null);

  if (!projectId) return null;

  const openCreate = () => {
    setName("");
    setOpen(true);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Enter a dashboard name", "error");
      return;
    }
    try {
      const dashboard = await createDashboard.mutateAsync(trimmed);
      setOpen(false);
      toast("Dashboard created", "success");
      navigate(`/projects/${projectId}/dashboards/${dashboard.id}`);
    } catch {
      toast("Couldn't create the dashboard — try again", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDashboard.mutateAsync(deleteTarget.id);
      toast("Dashboard deleted", "success");
      setDeleteTarget(null);
    } catch {
      toast("Couldn't delete the dashboard — try again", "error");
    }
  };

  if (projectLoading) {
    return (
      <div className="max-w-[1200px] px-11 py-9">
        <div className="h-6 w-40 animate-pulse rounded bg-bg-2" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-[1200px] px-11 py-9">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Project not found, or you don't have access to it.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] px-11 py-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Dashboards</div>
          <div className="mt-1 text-[13px] text-ink-3">
            {project.name} · {dashboards?.length ?? 0} dashboards
          </div>
        </div>
        <Button onClick={openCreate}>+ New dashboard</Button>
      </div>

      {isLoading && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[180px] animate-pulse rounded-xl border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load dashboards. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && dashboards && dashboards.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-1 px-8 py-16 text-center">
          <div className="text-[28px]">▦</div>
          <div className="text-[14px] font-semibold text-ink-1">No dashboards yet</div>
          <div className="max-w-[320px] text-[13px] text-ink-3">
            Create one to start arranging widgets for {project.name}.
          </div>
          <Button onClick={openCreate} className="mt-2">
            + New dashboard
          </Button>
        </div>
      )}

      {!isLoading && !isError && dashboards && dashboards.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {dashboards.map((d) => {
            const published = d.status === "published";
            const thumbTypes = d.widgetIds.slice(0, 3).map((id) => TYPE_ICON[widgetMap[id]?.type] || "▦");
            return (
              <div
                key={d.id}
                onClick={() => navigate(`/projects/${projectId}/dashboards/${d.id}`)}
                className="group cursor-pointer rounded-xl border border-border-default bg-bg-1 p-[18px] transition-colors hover:border-[#2e2e3a] hover:bg-[#131318]"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold text-ink-1">
                    {d.name}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(d);
                    }}
                    title="Delete dashboard"
                    className="shrink-0 cursor-pointer rounded-[5px] px-1 py-0.5 text-[12px] text-ink-3 opacity-0 transition-opacity hover:bg-[#2a1518] hover:text-brand-red group-hover:opacity-100"
                  >
                    ✕
                  </div>
                  <Badge bg={published ? "#0e2f24" : "var(--color-border-strong)"} color={published ? "var(--color-brand-green)" : "var(--color-ink-2)"}>
                    {d.status}
                  </Badge>
                </div>
                <div className="mb-3 grid h-[90px] grid-cols-3 gap-1.5 rounded-lg border border-border-subtle bg-surface-sunken p-2">
                  {thumbTypes.map((t, i) => (
                    <div key={i} className="flex items-center justify-center rounded-[5px] bg-bg-2 text-[14px] text-ink-3">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-ink-3">
                  <div>{d.widgetIds.length} widgets</div>
                  <div>Updated {timeAgo(d.updated_at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>New dashboard</DialogTitle>
          <Label htmlFor="dashboard-name">Dashboard name</Label>
          <Input
            id="dashboard-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Executive Overview"
          />
          <div className="mt-[22px] flex justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createDashboard.isPending}>
              {createDashboard.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete dashboard?"
        description={`This permanently deletes "${deleteTarget?.name}", including its layout and (if published) its public link. Widgets themselves aren't deleted.`}
        confirming={deleteDashboard.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
