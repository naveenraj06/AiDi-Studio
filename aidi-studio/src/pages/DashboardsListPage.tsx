import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import { timeAgo } from "@/lib/timeAgo";

export default function DashboardsListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, dashboardsByProject, widgetsByProject, actions, toast } = useApp();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const dashboards = (projectId && dashboardsByProject[projectId]) || [];
  const widgets = (projectId && widgetsByProject[projectId]) || [];
  const widgetMap = React.useMemo(() => {
    const m: Record<string, (typeof widgets)[number]> = {};
    widgets.forEach((w) => (m[w.id] = w));
    return m;
  }, [widgets]);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  if (!project || !projectId) return null;

  const openCreate = () => {
    setName("");
    setOpen(true);
  };

  const createDashboard = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Enter a dashboard name", "error");
      return;
    }
    const id = "d" + Math.random().toString(36).slice(2, 8);
    const slug =
      trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 20) +
      "-" +
      Math.random().toString(36).slice(2, 6);
    actions.setDashboards(projectId, (list) => [
      ...list,
      { id, name: trimmed, slug, status: "draft", updated_at: new Date().toISOString(), widgetIds: [] },
    ]);
    setOpen(false);
    toast("Dashboard created", "success");
    navigate(`/projects/${projectId}/dashboards/${id}`);
  };

  return (
    <div className="max-w-[1200px] px-11 py-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Dashboards</div>
          <div className="mt-1 text-[13px] text-ink-3">
            {project.name} · {dashboards.length} dashboards
          </div>
        </div>
        <Button onClick={openCreate}>+ New dashboard</Button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {dashboards.map((d) => {
          const published = d.status === "published";
          const thumbTypes = d.widgetIds.slice(0, 3).map((id) => TYPE_ICON[widgetMap[id]?.type] || "▦");
          return (
            <div
              key={d.id}
              onClick={() => navigate(`/projects/${projectId}/dashboards/${d.id}`)}
              className="cursor-pointer rounded-xl border border-border-default bg-bg-1 p-[18px] transition-colors hover:border-[#2e2e3a] hover:bg-[#131318]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="text-[14px] font-semibold text-ink-1">{d.name}</div>
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
            <Button onClick={createDashboard}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
