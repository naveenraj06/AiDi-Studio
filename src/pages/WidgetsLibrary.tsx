import { Link, useParams } from "react-router-dom";
import { widgets, widgetTemplates } from "@/data/widgets";
import { projects } from "@/data/projects";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreVertical, LayoutTemplate } from "lucide-react";

const typeLabel: Record<string, string> = {
  line: "Line Chart", bar: "Bar Chart", stat: "Stat", table: "Table", donut: "Donut", map: "Map",
};

export default function WidgetsLibrary() {
  const { projectId = "marketing-analytics" } = useParams();
  const project = projects.find((p) => p.id === projectId) ?? projects[0];

  return (
    <div className="flex min-h-screen bg-bg-0">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-1 text-[11px] text-ink-3">AiDi Studio &nbsp;/&nbsp; {project.name} &nbsp;/&nbsp; Widgets</div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-1">Widgets</h1>
            <p className="mt-1 text-sm text-ink-2">Reusable components for your dashboards.</p>
          </div>
          <Link to={`/app/projects/${projectId}/widgets/new`}>
            <Button><Plus className="h-4 w-4" /> New Widget</Button>
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search widgets..." className="pl-8" />
          </div>
          <Button variant="secondary" size="sm">All types ▾</Button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w) => (
            <div key={w.id} className="overflow-hidden rounded-lg border border-border bg-bg-1">
              <div className="h-24 bg-bg-2 p-2">
                <WidgetRenderer widget={w} compact />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="text-[13px] font-medium text-ink-1">{w.name}</div>
                  <MoreVertical className="h-4 w-4 shrink-0 text-ink-3" />
                </div>
                <div className="mt-2"><Badge>{typeLabel[w.type]}</Badge></div>
                <div className="mt-2 text-[10px] text-ink-3">Updated {w.updatedAt}</div>
              </div>
            </div>
          ))}

          <Link
            to={`/app/projects/${projectId}/widgets/new`}
            className="flex min-h-[176px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-violet/25 bg-brand-violet/5 text-brand-violetLight transition-colors hover:bg-brand-violet/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-violet/15">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">Create Widget</span>
            <span className="text-[11px] text-ink-3">Build a new reusable component</span>
          </Link>
        </div>

        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          <LayoutTemplate className="h-3.5 w-3.5" /> Templates
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {widgetTemplates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-1 p-4">
              <div>
                <div className="text-sm font-medium text-ink-1">{t.name}</div>
                <div className="mt-1 text-[11px] text-ink-3">{t.widgetCount} widgets &middot; {t.apiSource}</div>
              </div>
              <Button variant="secondary" size="sm">Use template</Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
