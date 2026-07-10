import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useCreateProject, useDeleteProject, useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Project } from "@/types";

const ICONS = ["📊", "🚀", "🎧", "📈", "🔧", "💡", "🌐", "🧭"];
const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171"];

export default function ProjectsPage() {
  const { toast } = useApp();
  const { data: projects, isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null);

  const openCreate = () => {
    setName("");
    setOpen(true);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Enter a project name", "error");
      return;
    }
    const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    try {
      const project = await createProject.mutateAsync({ name: trimmed, icon, color });
      setOpen(false);
      toast("Project created", "success");
      navigate(`/projects/${project.id}/dashboards`);
    } catch {
      toast("Couldn't create the project — try again", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast("Project deleted", "success");
      setDeleteTarget(null);
    } catch {
      toast("Couldn't delete the project — try again", "error");
    }
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

      {isLoading && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[128px] animate-pulse rounded-xl border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load your projects. Check your connection and try refreshing.
        </div>
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-1 px-8 py-16 text-center">
          <div className="text-[28px]">📊</div>
          <div className="text-[14px] font-semibold text-ink-1">Create your first project</div>
          <div className="max-w-[320px] text-[13px] text-ink-3">
            A project holds its own dashboards, widgets, and API resources — most teams start with one.
          </div>
          <Button onClick={openCreate} className="mt-2">
            + New project
          </Button>
        </div>
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}/dashboards`)}
              className="group relative flex cursor-pointer flex-col gap-3.5 rounded-xl border border-border-default bg-bg-1 p-5 transition-colors hover:border-[#2e2e3a] hover:bg-[#131318]"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(p);
                }}
                title="Delete project"
                className="absolute right-3 top-3 cursor-pointer rounded-[5px] px-1.5 py-0.5 text-[12px] text-ink-3 opacity-0 transition-opacity hover:bg-[#2a1518] hover:text-brand-red group-hover:opacity-100"
              >
                ✕
              </div>
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
      )}

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
            <Button onClick={handleCreate} disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project?"
        description={`This permanently deletes "${deleteTarget?.name}" along with all of its dashboards, widgets, API resources, and team access. This can't be undone.`}
        confirming={deleteProject.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
