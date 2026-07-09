import { Link } from "react-router-dom";
import { projects } from "@/data/projects";
import { colorMap } from "@/components/widgets/colorMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search, Plus, TrendingUp, LineChart, Heart, BarChart3, Wallet, MoreVertical, LayoutGrid, List,
} from "lucide-react";

const icons: Record<string, any> = { TrendingUp, LineChart, Heart, BarChart3, Wallet };

export default function Projects() {
  return (
    <div className="flex min-h-screen bg-bg-0">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-1">Projects</h1>
            <p className="mt-1 text-sm text-ink-2">Organize your dashboards, widgets, and data in projects.</p>
          </div>
          <Button><Plus className="h-4 w-4" /> New Project</Button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search projects..." className="pl-8" />
          </div>
          <Button variant="secondary" size="sm">All ▾</Button>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="secondary" size="icon" className="bg-brand-violet/15 text-brand-violetLight border-none"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><List className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const Icon = icons[p.icon];
            const c = colorMap[p.color];
            return (
              <Link
                key={p.id}
                to={`/app/projects/${p.id}/dashboards`}
                className="group relative overflow-hidden rounded-lg border border-border bg-bg-1 p-4 transition-colors hover:border-border-strong"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${c.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${c.text}`} />
                  </div>
                  <MoreVertical className="h-4 w-4 text-ink-3" />
                </div>
                <div className="text-sm font-medium text-ink-1">{p.name}</div>
                <div className="mt-1.5 text-xs text-ink-3">{p.dashboardCount} Dashboards &middot; {p.widgetCount} Widgets</div>
                <div className="mt-1 text-[11px] text-ink-3">Updated {p.updatedAt}</div>
                <div className={`absolute inset-x-0 bottom-0 h-0.5 ${c.bg.replace("/12", "/40")}`} />
              </Link>
            );
          })}

          <button className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong text-ink-3 transition-colors hover:border-brand-violet/40 hover:text-brand-violetLight hover:bg-brand-violet/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-violet/10">
              <Plus className="h-4 w-4 text-brand-violetLight" />
            </div>
            <span className="text-xs font-medium">New Project</span>
            <span className="text-[11px] text-ink-3">Create a new project</span>
          </button>
        </div>
      </main>
    </div>
  );
}
