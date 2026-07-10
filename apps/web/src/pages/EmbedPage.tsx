import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProject } from "@/hooks/useProjects";
import { useDashboards } from "@/hooks/useDashboards";

const API_ROWS = [
  { method: "GET", path: "/api/public/d/:slug" },
  { method: "GET", path: "/api/public/d/:slug/widgets/:widgetId/data" },
  { method: "POST", path: "/api/public/d/:slug/unlock" },
];

export default function EmbedPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useApp();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: dashboards, isLoading, isError } = useDashboards(projectId);

  const published = (dashboards ?? []).filter((d) => d.status === "published");

  const copySnippet = (snippet: string) => {
    navigator.clipboard?.writeText(snippet).catch(() => {});
    toast("Embed snippet copied", "success");
  };

  const firstSlug = published[0]?.slug ?? "your-dashboard-slug";

  if (projectLoading) {
    return (
      <div className="max-w-[860px] px-11 py-9">
        <div className="h-6 w-40 animate-pulse rounded bg-bg-2" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-[860px] px-11 py-9">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Project not found, or you don't have access to it.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] px-11 py-9">
      <div className="font-display mb-1 text-[24px] font-bold text-ink-1">Embed &amp; SDK</div>
      <div className="mb-[26px] text-[13px] text-ink-3">
        {project.name} · only published dashboards can be embedded.
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">Published dashboards</div>
      <div className="mb-[30px] flex flex-col gap-2.5">
        {isLoading &&
          [0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-[10px] border border-border-default bg-bg-2" />)}

        {isError && (
          <div className="rounded-[10px] border border-border-default bg-bg-1 p-5 text-[13px] text-ink-3">
            Couldn't load dashboards. Try refreshing.
          </div>
        )}

        {!isLoading &&
          !isError &&
          published.map((d) => {
            const snippet = `<iframe src="${window.location.origin}/d/${d.slug}/embed" width="100%" height="600" frameborder="0"></iframe>`;
            return (
              <div key={d.id} className="rounded-[10px] border border-border-default bg-bg-1 px-[18px] py-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-ink-1">{d.name}</div>
                  <div onClick={() => copySnippet(snippet)} className="cursor-pointer text-[12px] text-brand-violet-light">
                    Copy iframe snippet
                  </div>
                </div>
                <div className="break-all rounded-[7px] border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[11px] text-ink-3">
                  {snippet}
                </div>
              </div>
            );
          })}

        {!isLoading && !isError && published.length === 0 && (
          <div className="rounded-[10px] border border-border-default bg-bg-1 p-5 text-[13px] text-ink-3">
            No published dashboards yet — publish one from the dashboard canvas to get an embed snippet.
          </div>
        )}
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">React SDK</div>
      <div className="mb-5 rounded-[10px] border border-border-default bg-bg-1 p-[18px]">
        <div className="mb-2.5 text-[12px] text-ink-2">1. Install the package</div>
        <div className="mb-4 rounded-[7px] border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-brand-green">
          npm install @aidistudio/embed
        </div>
        <div className="mb-2.5 text-[12px] text-ink-2">2. Mount the component</div>
        <div className="whitespace-pre-wrap rounded-[7px] border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-ink-3">
          {`import { AidiDashboard } from '@aidistudio/embed';\n\n<AidiDashboard token="YOUR_PUBLIC_TOKEN" dashboardId="${firstSlug}" />`}
        </div>
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">
        API reference — raw data access
      </div>
      <div className="overflow-hidden rounded-[10px] border border-border-default bg-bg-1">
        {API_ROWS.map((row) => (
          <div
            key={row.path}
            className="flex items-center gap-3 border-b border-border-subtle px-[18px] py-3 last:border-b-0"
          >
            <div className="rounded-[5px] bg-[#0e2f24] px-2 py-[3px] text-[10px] font-bold text-brand-green">
              {row.method}
            </div>
            <div className="font-mono text-[12px] text-ink-2">{row.path}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
