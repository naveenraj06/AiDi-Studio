import * as React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectQuery } from "@/store/api/projectsApi";
import {
  useCreateResourceMutation,
  useDeleteResourceMutation,
  useGetResourcesQuery,
  useTestResourceConnectionMutation,
} from "@/store/api/resourcesApi";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImportResourceDialog, type ResourceFormResult } from "@/components/resources/ImportResourceDialog";
import type { ApiResource } from "@/types";

export default function ResourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useAuth();

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  const { data: resources, isLoading, isError } = useGetResourcesQuery(projectId ?? "", { skip: !projectId });
  const [createResource, { isLoading: creating }] = useCreateResourceMutation();
  const [testConnection] = useTestResourceConnectionMutation();
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation();

  const [showImport, setShowImport] = React.useState(false);
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiResource | null>(null);

  if (!projectId) return null;

  const handleAdd = async (result: ResourceFormResult) => {
    try {
      await createResource({ projectId: projectId ?? "", input: result }).unwrap();
      setShowImport(false);
      toast("Resource added — run Test to verify it's reachable", "success");
    } catch {
      toast("Couldn't add the resource — try again", "error");
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const resource = await testConnection({ projectId: projectId ?? "", id }).unwrap();
      toast(
        resource.status === "healthy"
          ? `Connection healthy — ${resource.last_test_latency_ms}ms`
          : "Connection failed",
        resource.status === "healthy" ? "success" : "error",
      );
    } catch {
      toast("Couldn't test the connection — try again", "error");
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource({ projectId: projectId ?? "", id: deleteTarget.id }).unwrap();
      toast("Resource deleted", "success");
      setDeleteTarget(null);
    } catch {
      toast("Couldn't delete the resource — try again", "error");
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
          <div className="font-display text-[24px] font-bold text-ink-1">API Resources</div>
          <div className="mt-1 text-[13px] text-ink-3">
            {project.name} · {resources?.length ?? 0} connected · GET only in v1
          </div>
        </div>
        <Button onClick={() => setShowImport(true)}>+ Add resource</Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load API resources. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && resources && resources.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-1 px-8 py-16 text-center">
          <div className="text-[28px]">⇄</div>
          <div className="text-[14px] font-semibold text-ink-1">Connect your first API</div>
          <div className="max-w-[320px] text-[13px] text-ink-3">
            Widgets read from API resources — add one to start building.
          </div>
          <Button onClick={() => setShowImport(true)} className="mt-2">
            + Add resource
          </Button>
        </div>
      )}

      {!isLoading && !isError && resources && resources.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-default bg-bg-1">
          <div
            className="grid gap-2 border-b border-border-default px-[18px] py-3 text-[11px] uppercase tracking-[0.03em] text-ink-3"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 130px" }}
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
            const testing = testingId === r.id;
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
                <div className="flex items-center justify-end gap-3">
                  <div
                    onClick={testing ? undefined : () => handleTest(r.id)}
                    className="cursor-pointer text-[12px] font-semibold text-brand-violet-light"
                    style={testing ? { opacity: 0.6, pointerEvents: "none" } : undefined}
                  >
                    {testing ? "Testing…" : "Test"}
                  </div>
                  <div
                    onClick={() => setDeleteTarget(r)}
                    title="Delete resource"
                    className="cursor-pointer text-[12px] text-ink-3 hover:text-brand-red"
                  >
                    ✕
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ImportResourceDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSubmit={handleAdd}
        submitting={creating}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete resource?"
        description={
          deleteTarget && deleteTarget.usedBy > 0
            ? `"${deleteTarget.name}" is used by ${deleteTarget.usedBy} widget${deleteTarget.usedBy === 1 ? "" : "s"}. Deleting it leaves those widgets without a data source — they'll need a new resource assigned.`
            : `This permanently deletes "${deleteTarget?.name}".`
        }
        confirming={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
