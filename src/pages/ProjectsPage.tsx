import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ICONS = ["📊", "🚀", "🎧", "📈", "🔧", "💡", "🌐", "🧭"];
const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171"];

export default function ProjectsPage() {
  const { projects, actions, toast } = useApp();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const openCreate = () => {
    setName("");
    setOpen(true);
  };

  const createProject = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Enter a project name", "error");
      return;
    }
    const id = "p" + Math.random().toString(36).slice(2, 8);
    const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    actions.setProjects((list) => [
      ...list,
      {
        id,
        name: trimmed,
        icon,
        color,
        plan: "free",
        owner_id: "u1",
        created_at: new Date().toISOString(),
        dashboards: 0,
        widgets: 0,
        resources: 0,
      },
    ]);
    setOpen(false);
    toast("Project created", "success");
    navigate(`/projects/${id}/dashboards`);
  };

  return (
    <div className="max-w-[1200px] px-11 py-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Projects</div>
          <div className="mt-1 text-[13px] text-ink-3">
            Each project has its own dashboards, widgets, and API resources.
          </div>
        </div>
        <Button onClick={openCreate}>+ New project</Button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}/dashboards`)}
            className="flex cursor-pointer flex-col gap-3.5 rounded-xl border border-border-default bg-bg-1 p-5 transition-colors hover:border-[#2e2e3a] hover:bg-[#131318]"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] text-[17px]"
                style={{ background: `${p.color}22`, border: `1px solid ${p.color}55` }}
              >
                {p.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold text-ink-1">
                  {p.name}
                </div>
                <div className="text-[11px] capitalize text-ink-3">{p.plan} plan</div>
              </div>
            </div>
            <div className="flex gap-[18px] border-t border-border-default pt-3.5 text-[12px] text-ink-2">
              <div>
                <span className="font-semibold text-ink-1">{p.dashboards}</span> dashboards
              </div>
              <div>
                <span className="font-semibold text-ink-1">{p.widgets}</span> widgets
              </div>
              <div>
                <span className="font-semibold text-ink-1">{p.resources}</span> APIs
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>New project</DialogTitle>
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Analytics"
          />
          <div className="mt-2 text-[11px] text-ink-3">Free plan · 1 project, 3 dashboards, 10 widgets</div>
          <div className="mt-[22px] flex justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProject}>Create project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
