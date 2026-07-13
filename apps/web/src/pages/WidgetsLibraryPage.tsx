import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectQuery } from "@/store/api/projectsApi";
import { useDeleteWidgetMutation, useDuplicateWidgetMutation, useGetWidgetsQuery } from "@/store/api/widgetsApi";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CATEGORY_LABEL, TYPE_ICON, TYPE_LABEL } from "@/components/widgets/widgetTypeMeta";
import type { Widget, WidgetCategory } from "@/types";

export default function WidgetsLibraryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useAuth();
  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  const { data: widgets, isLoading, isError } = useGetWidgetsQuery(projectId ?? "", { skip: !projectId });
  const [deleteWidget, { isLoading: deleting }] = useDeleteWidgetMutation();
  const [duplicateWidget, { isLoading: duplicating }] = useDuplicateWidgetMutation();
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = React.useState<Widget | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<WidgetCategory | "all">("all");

  const regular = (widgets ?? []).filter((w) => !w.is_template);
  const allTemplates = (widgets ?? []).filter((w) => w.is_template);
  const templateCategories = Array.from(new Set(allTemplates.map((w) => w.category).filter((c): c is WidgetCategory => !!c)));
  const templates = categoryFilter === "all" ? allTemplates : allTemplates.filter((w) => w.category === categoryFilter);

  if (!projectId) return null;

  const openWidget = (w: Widget) => navigate(`/projects/${projectId}/widgets/${w.id}`);
  const createWidget = () => navigate(`/projects/${projectId}/widgets/new`);

  const applyTemplate = async (w: Widget) => {
    try {
      const copy = await duplicateWidget({ projectId, id: w.id }).unwrap();
      toast(`"${w.name}" copied — attach a resource to finish it`, "success");
      navigate(`/projects/${projectId}/widgets/${copy.id}?fromTemplate=1`);
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't use this template — try again"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWidget({ projectId: projectId ?? "", id: deleteTarget.id }).unwrap();
      toast("Widget deleted", "success");
      setDeleteTarget(null);
    } catch {
      toast("Couldn't delete the widget — try again", "error");
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
          <div className="font-display text-[24px] font-bold text-ink-1">Widgets</div>
          <div className="mt-1 text-[13px] text-ink-3">{project.name} · reusable across every dashboard</div>
        </div>
        <Button onClick={createWidget}>+ New widget</Button>
      </div>

      {isLoading && (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[132px] animate-pulse rounded-xl border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load widgets. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && widgets && widgets.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-1 px-8 py-16 text-center">
          <div className="text-[28px]">◨</div>
          <div className="text-[14px] font-semibold text-ink-1">No widgets yet</div>
          <div className="max-w-[320px] text-[13px] text-ink-3">
            Widgets read from an API resource and can be reused across dashboards.
          </div>
          <Button onClick={createWidget} className="mt-2">
            + New widget
          </Button>
        </div>
      )}

      {!isLoading && !isError && widgets && widgets.length > 0 && (
        <>
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">
            Library ({regular.length})
          </div>
          <div
            className="mb-8 grid gap-3.5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}
          >
            {regular.map((w) => (
              <div
                key={w.id}
                onClick={() => openWidget(w)}
                className="group relative cursor-pointer rounded-xl border border-border-default bg-bg-1 p-4 transition-colors hover:border-border-strong"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(w);
                  }}
                  title="Delete widget"
                  className="absolute right-2 top-2 cursor-pointer rounded-xs px-1.5 py-0.5 text-[12px] text-ink-3 opacity-0 transition-opacity hover:bg-brand-red-surface hover:text-brand-red group-hover:opacity-100"
                >
                  ✕
                </div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink-1">
                    {w.name}
                  </div>
                  <div className="ml-1.5 shrink-0 rounded-full bg-bg-3 px-[7px] py-0.5 text-[9px] font-bold uppercase text-brand-violet-light">
                    {w.type}
                  </div>
                </div>
                <div className="mb-2.5 flex h-16 items-center justify-center rounded-lg border border-border-subtle bg-surface-sunken text-[26px] text-ink-3">
                  {TYPE_ICON[w.type]}
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-ink-3">
                  Source: {w.resource ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {allTemplates.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">
                  Templates ({templates.length})
                </div>
                {templateCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: categoryFilter === "all" ? "var(--color-surface-selected)" : "var(--color-bg-2)",
                        color: categoryFilter === "all" ? "var(--color-brand-violet-light)" : "var(--color-ink-3)",
                      }}
                    >
                      All
                    </button>
                    {templateCategories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: categoryFilter === c ? "var(--color-surface-selected)" : "var(--color-bg-2)",
                          color: categoryFilter === c ? "var(--color-brand-violet-light)" : "var(--color-ink-3)",
                        }}
                      >
                        {CATEGORY_LABEL[c]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
                {templates.map((w) => (
                  <div
                    key={w.id}
                    className="group relative flex flex-col rounded-xl border border-dashed border-border-muted bg-bg-1 p-4 transition-colors hover:border-border-track"
                  >
                    <div
                      onClick={() => setDeleteTarget(w)}
                      title="Delete template"
                      className="absolute right-2 top-2 cursor-pointer rounded-xs px-1.5 py-0.5 text-[12px] text-ink-3 opacity-0 transition-opacity hover:bg-brand-red-surface hover:text-brand-red group-hover:opacity-100"
                    >
                      ✕
                    </div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-ink-1">{w.name}</div>
                      <div className="rounded-full bg-bg-3 px-[7px] py-0.5 text-[9px] font-bold uppercase text-brand-violet-light">
                        {TYPE_LABEL[w.type]}
                      </div>
                    </div>
                    <div
                      onClick={() => openWidget(w)}
                      className="mb-2.5 flex h-16 cursor-pointer items-center justify-center rounded-lg border border-border-subtle bg-surface-sunken text-[26px] text-ink-3"
                    >
                      {TYPE_ICON[w.type]}
                    </div>
                    <div className="mb-2.5 flex items-center justify-between">
                      {w.category ? (
                        <span className="text-[10px] uppercase tracking-[0.03em] text-ink-3">
                          {CATEGORY_LABEL[w.category]}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        onClick={() => openWidget(w)}
                        className="cursor-pointer text-[11px] text-ink-3 underline hover:text-ink-1"
                      >
                        Edit
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => applyTemplate(w)} disabled={duplicating}>
                      Use template
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete widget?"
        description={`This removes "${deleteTarget?.name}" from every dashboard it's on and can't be undone.`}
        confirming={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
