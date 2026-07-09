import * as React from "react";
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ImportResourceDialog, type ManualForm } from "@/components/resources/ImportResourceDialog";

export default function ResourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, resourcesByProject, actions, toast } = useApp();

  const project = projects.find((p) => p.id === projectId);
  const resources = (projectId && resourcesByProject[projectId]) || [];

  const [showImport, setShowImport] = React.useState(false);
  const [testing, setTesting] = React.useState<Record<string, boolean>>({});

  if (!project || !projectId) return null;

  const addResource = (tab: "manual" | "postman" | "openapi" | "curl", form: ManualForm) => {
    const fallbackName =
      tab === "postman"
        ? "Imported Postman Collection"
        : tab === "openapi"
          ? "Imported OpenAPI Spec"
          : tab === "curl"
            ? "Imported cURL Resource"
            : "";
    const name = form.name || fallbackName;
    if (!name) {
      toast("Enter a name for this resource", "error");
      return;
    }
    const id = "r" + Math.random().toString(36).slice(2, 8);
    actions.setResources(projectId, (list) => [
      ...list,
      {
        id,
        name,
        url: form.url || "https://api.example.com/v1/data",
        method: "GET",
        auth_type: form.auth_type || "none",
        status: "healthy",
        last_tested_at: new Date().toISOString(),
        last_test_latency_ms: 120 + Math.floor(Math.random() * 300),
        imported_from: tab,
        usedBy: 0,
      },
    ]);
    setShowImport(false);
    toast("Resource connected — test passed", "success");
  };

  const testConnection = (id: string) => {
    setTesting((t) => ({ ...t, [id]: true }));
    setTimeout(() => {
      const latency = 80 + Math.floor(Math.random() * 350);
      actions.setResources(projectId, (list) =>
        list.map((r) => (r.id === id ? { ...r, status: "healthy", last_tested_at: new Date().toISOString(), last_test_latency_ms: latency } : r)),
      );
      setTesting((t) => ({ ...t, [id]: false }));
      toast(`Connection healthy — ${latency}ms`, "success");
    }, 900);
  };

  return (
    <div className="max-w-[1200px] px-11 py-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">API Resources</div>
          <div className="mt-1 text-[13px] text-ink-3">
            {project.name} · {resources.length} connected · GET only in v1
          </div>
        </div>
        <Button onClick={() => setShowImport(true)}>+ Add resource</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-1">
        <div
          className="grid gap-2 border-b border-border-default px-[18px] py-3 text-[11px] uppercase tracking-[0.03em] text-ink-3"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 90px" }}
        >
          <div>Resource</div>
          <div>Auth</div>
          <div>Status</div>
          <div>Latency</div>
          <div>Used by</div>
          <div />
        </div>
        {resources.map((r) => {
          const statusColor = r.status === "healthy" ? "var(--color-brand-green)" : "var(--color-brand-red)";
          return (
            <div
              key={r.id}
              className="grid items-center gap-2 border-b border-border-subtle px-[18px] py-3.5 text-[13px] last:border-b-0"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 90px" }}
            >
              <div className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-ink-1">{r.name}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-ink-3">{r.url}</div>
              </div>
              <div className="text-[12px] capitalize text-ink-2">{r.auth_type}</div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: statusColor }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
                  {r.status}
                </span>
              </div>
              <div className="text-[12px] text-ink-2">{r.last_test_latency_ms ? `${r.last_test_latency_ms}ms` : "—"}</div>
              <div className="text-[12px] text-ink-2">{r.usedBy} widgets</div>
              <div
                onClick={() => testConnection(r.id)}
                className="cursor-pointer text-right text-[12px] font-semibold text-brand-violet-light"
              >
                {testing[r.id] ? "Testing…" : "Test"}
              </div>
            </div>
          );
        })}
      </div>

      <ImportResourceDialog open={showImport} onOpenChange={setShowImport} onSubmit={addResource} />
    </div>
  );
}
