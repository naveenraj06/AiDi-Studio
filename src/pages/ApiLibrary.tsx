import { useParams } from "react-router-dom";
import { apiResources } from "@/data/apiResources";
import { projects } from "@/data/projects";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, Sparkles, MoreVertical } from "lucide-react";

const importSources = ["Postman Collection", "OpenAPI / Swagger", "cURL command", "Paste URL"];

export default function ApiLibrary() {
  const { projectId = "marketing-analytics" } = useParams();
  const project = projects.find((p) => p.id === projectId) ?? projects[0];

  return (
    <div className="flex min-h-screen bg-bg-0">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-1 text-[11px] text-ink-3">AiDi Studio &nbsp;/&nbsp; {project.name} &nbsp;/&nbsp; API Library</div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-1">API Library</h1>
            <p className="mt-1 max-w-lg text-sm text-ink-2">
              Connect once, reuse everywhere. Every widget in this project pulls from these resources.
            </p>
          </div>
          <div className="flex gap-2">
            <Button><Upload className="h-4 w-4" /> Import Collection</Button>
            <Button variant="secondary"><Plus className="h-4 w-4" /> Add Endpoint</Button>
          </div>
        </div>

        <div className="mb-5 rounded-lg border border-border bg-bg-1 p-4">
          <div className="mb-3 text-xs font-medium text-ink-2">Import from:</div>
          <div className="flex flex-wrap gap-2">
            {importSources.map((s) => (
              <button key={s} className="rounded-md border border-border-strong bg-bg-3 px-3.5 py-2 text-xs font-medium text-ink-2 transition-colors hover:border-brand-violet/40 hover:text-ink-1">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-2 text-[10px] uppercase tracking-wide text-ink-3">
                <th className="px-4 py-2.5 font-medium">Resource</th>
                <th className="px-4 py-2.5 font-medium">Method</th>
                <th className="px-4 py-2.5 font-medium">Auth</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Used by</th>
                <th className="px-4 py-2.5 font-medium">Last tested</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {apiResources.map((r, i) => (
                <tr key={r.id} className={`border-b border-border last:border-0 ${i % 2 ? "bg-white/[0.015]" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-1">{r.name}</div>
                    <div className="text-[11px] text-ink-3">{r.url}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="green">{r.method}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="cyan">{r.authType}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "healthy" ? "green" : "red"}>
                      {r.status === "healthy" ? "● Healthy" : "● Auth error"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{r.usedByCount} widgets</td>
                  <td className="px-4 py-3 text-ink-3">{r.lastTested}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm">Test</Button>
                      <MoreVertical className="h-4 w-4 text-ink-3" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-brand-violet/20 bg-brand-violet/5 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-violetLight" />
          <p className="text-[13px] text-brand-violetLight">
            When you build a widget from any resource, AI reads the response schema and suggests the right component and field mapping automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
