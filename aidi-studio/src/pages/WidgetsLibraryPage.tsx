import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import type { Widget } from "@/types";

export default function WidgetsLibraryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, widgetsByProject } = useApp();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const widgets = (projectId && widgetsByProject[projectId]) || [];

  const regular = widgets.filter((w) => !w.is_template);
  const templates = widgets.filter((w) => w.is_template);

  if (!project || !projectId) return null;

  const openWidget = (w: Widget) => navigate(`/projects/${project.id}/widgets/${w.id}`);
  const createWidget = () => navigate(`/projects/${project.id}/widgets/new`);

  return (
    <div className="max-w-[1200px] px-11 py-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Widgets</div>
          <div className="mt-1 text-[13px] text-ink-3">{project.name} · reusable across every dashboard</div>
        </div>
        <Button onClick={createWidget}>+ New widget</Button>
      </div>

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
            className="cursor-pointer rounded-xl border border-border-default bg-bg-1 p-4 transition-colors hover:border-[#2e2e3a]"
          >
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
              Source: {w.resource}
            </div>
          </div>
        ))}
      </div>

      {templates.length > 0 && (
        <>
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">
            Templates ({templates.length})
          </div>
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {templates.map((w) => (
              <div
                key={w.id}
                onClick={() => openWidget(w)}
                className="cursor-pointer rounded-xl border border-dashed border-border-muted bg-bg-1 p-4 transition-colors hover:border-border-track"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-ink-1">{w.name}</div>
                  <div className="rounded-full bg-bg-3 px-[7px] py-0.5 text-[9px] font-bold uppercase text-brand-violet-light">
                    {w.type}
                  </div>
                </div>
                <div className="flex h-16 items-center justify-center rounded-lg border border-border-subtle bg-surface-sunken text-[26px] text-ink-3">
                  {TYPE_ICON[w.type]}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
