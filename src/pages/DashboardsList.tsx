import { Link, useParams } from "react-router-dom";
import { dashboards } from "@/data/dashboards";
import { projects } from "@/data/projects";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreVertical, Globe, Lock } from "lucide-react";

export default function DashboardsList() {
  const { projectId = "marketing-analytics" } = useParams();
  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const projectDashboards = dashboards.filter((d) => d.projectId === projectId);

  return (
    <div className="flex min-h-screen bg-bg-0">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-1 text-[11px] text-ink-3">AiDi Studio &nbsp;/&nbsp; {project.name} &nbsp;/&nbsp; Dashboards</div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-1">Dashboards</h1>
            <p className="mt-1 text-sm text-ink-2">View and manage all dashboards in this project.</p>
          </div>
          <Link to={`/app/projects/${projectId}/dashboards/new`}>
            <Button><Plus className="h-4 w-4" /> New Dashboard</Button>
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search dashboards..." className="pl-8" />
          </div>
          <Button variant="secondary" size="sm">All statuses ▾</Button>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-2 text-[10px] uppercase tracking-wide text-ink-3">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Widgets</th>
                <th className="px-4 py-2.5 font-medium">Visibility</th>
                <th className="px-4 py-2.5 font-medium">Updated</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {projectDashboards.map((d, i) => (
                <tr key={d.id} className={`border-b border-border last:border-0 ${i % 2 ? "bg-white/[0.015]" : ""}`}>
                  <td className="px-4 py-3">
                    <Link to={`/app/projects/${projectId}/dashboards/${d.id}`} className="font-medium text-ink-1 hover:text-brand-violetLight">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === "published" ? "green" : "amber"}>
                      {d.status === "published" ? "● Live" : "○ Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{d.widgetIds.length}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.visibility === "public" ? "cyan" : "neutral"}>
                      {d.visibility === "public" ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                      {d.visibility === "public" ? "Public" : "Private"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-3">{d.updatedAt}</td>
                  <td className="px-4 py-3 text-right"><MoreVertical className="ml-auto h-4 w-4 text-ink-3" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <Button variant="secondary" size="sm" className="bg-brand-violet/15 text-brand-violetLight border-none">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">→</Button>
        </div>
      </main>
    </div>
  );
}
