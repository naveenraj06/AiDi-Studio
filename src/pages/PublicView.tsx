import { useParams } from "react-router-dom";
import { dashboards } from "@/data/dashboards";
import { widgets as allWidgets } from "@/data/widgets";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PublicView() {
  const { slug } = useParams();
  const dashboard = dashboards.find((d) => d.slug === slug) ?? dashboards[0];
  const dashboardWidgets = dashboard.widgetIds.map((id) => allWidgets.find((w) => w.id === id)!).filter(Boolean);

  return (
    <div className="min-h-screen bg-bg-0">
      <div className="flex h-14 items-center gap-3 border-b border-border bg-bg-1 px-5">
        <Logo size={20} />
        <span className="ml-auto text-xs text-ink-3">Last updated: 2 minutes ago</span>
        <Button variant="secondary" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
        <a href="/login" className="text-xs font-medium text-brand-violetLight hover:underline">Sign up free →</a>
      </div>

      <div className="p-6">
        <h1 className="mb-1 text-xl font-bold text-ink-1">{dashboard.name}</h1>
        <div className="mb-5 flex gap-2">
          <select className="rounded-md border border-border-strong bg-bg-3 px-3 py-1.5 text-xs text-ink-2">
            <option>Last 30 days</option>
          </select>
          <select className="rounded-md border border-border-strong bg-bg-3 px-3 py-1.5 text-xs text-ink-2">
            <option>All regions</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardWidgets.map((w) => (
            <div key={w.id} className={`rounded-lg border border-border bg-bg-1 p-3 ${w.type === "table" || w.type === "line" ? "sm:col-span-2" : ""}`}>
              <div className="mb-2 text-xs font-medium text-ink-1">{w.name}</div>
              <WidgetRenderer widget={w} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-ink-3">
        Built with AiDi Studio &middot; <a href="/login" className="text-brand-violetLight hover:underline">Create your own dashboard →</a>
      </div>
    </div>
  );
}
