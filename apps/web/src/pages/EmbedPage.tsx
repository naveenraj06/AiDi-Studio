import * as React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectQuery } from "@/store/api/projectsApi";
import { useGetDashboardsQuery } from "@/store/api/dashboardsApi";
import { useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation } from "@/store/api/apiKeysApi";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from "@/lib/timeAgo";

const API_ROWS = [
  { method: "GET", path: "/public/dashboards/:slug" },
  { method: "GET", path: "/sdk/dashboards/:slug" },
];

export default function EmbedPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useAuth();
  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  const { data: dashboards, isLoading, isError } = useGetDashboardsQuery(projectId ?? "", { skip: !projectId });
  const { data: apiKeys } = useGetApiKeysQuery(projectId ?? "", { skip: !projectId || project?.plan === "free" });
  const [createApiKey, { isLoading: creatingKey }] = useCreateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [keyName, setKeyName] = React.useState("");
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null);

  const published = (dashboards ?? []).filter((d) => d.status === "published");

  const onCreateKey = async () => {
    if (!projectId) return;
    if (!keyName.trim()) return toast("Enter a name for this key", "error");
    try {
      const created = await createApiKey({ projectId, name: keyName.trim() }).unwrap();
      setRevealedKey(created.key);
      setKeyName("");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't create the API key"), "error");
    }
  };

  const onRevokeKey = async (id: string) => {
    if (!projectId) return;
    try {
      await revokeApiKey({ projectId, id }).unwrap();
      toast("API key revoked", "info");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't revoke the API key"), "error");
    }
  };

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
          [0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border border-border-default bg-bg-2" />)}

        {isError && (
          <div className="rounded-lg border border-border-default bg-bg-1 p-5 text-[13px] text-ink-3">
            Couldn't load dashboards. Try refreshing.
          </div>
        )}

        {!isLoading &&
          !isError &&
          published.map((d) => {
            const snippet = `<iframe src="${window.location.origin}/d/${d.slug}/embed" width="100%" height="600" frameborder="0"></iframe>`;
            return (
              <div key={d.id} className="rounded-lg border border-border-default bg-bg-1 px-[18px] py-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-ink-1">{d.name}</div>
                  <div onClick={() => copySnippet(snippet)} className="cursor-pointer text-[12px] text-brand-violet-light">
                    Copy iframe snippet
                  </div>
                </div>
                <div className="break-all rounded-sm border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[11px] text-ink-3">
                  {snippet}
                </div>
              </div>
            );
          })}

        {!isLoading && !isError && published.length === 0 && (
          <div className="rounded-lg border border-border-default bg-bg-1 p-5 text-[13px] text-ink-3">
            No published dashboards yet — publish one from the dashboard canvas to get an embed snippet.
          </div>
        )}
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">React SDK</div>
      <div className="mb-5 rounded-lg border border-border-default bg-bg-1 p-[18px]">
        <div className="mb-2.5 text-[12px] text-ink-2">1. Install the package</div>
        <div className="mb-4 rounded-sm border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-brand-green">
          npm install @aidistudio/embed
        </div>
        <div className="mb-2.5 text-[12px] text-ink-2">2a. Drop-in iframe (no API key needed)</div>
        <div className="mb-4 whitespace-pre-wrap rounded-sm border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-ink-3">
          {`import { AidiDashboard } from '@aidistudio/embed';\n\n<AidiDashboard baseUrl="${window.location.origin}" dashboardId="${firstSlug}" />`}
        </div>
        <div className="mb-2.5 text-[12px] text-ink-2">
          2b. Native — no iframe, renders with your own components (Pro/Org, needs an API key below)
        </div>
        <div className="whitespace-pre-wrap rounded-sm border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-ink-3">
          {`import { useAidiDashboardData } from '@aidistudio/embed';\n\nconst { data, loading } = useAidiDashboardData({\n  apiKey: 'aidi_...',\n  baseUrl: "${window.location.origin}",\n  dashboardSlug: "${firstSlug}",\n});`}
        </div>
        <div className="mt-2.5 text-[11px] text-ink-3">
          The iframe option never exposes API credentials to the embedding page. The native option authenticates
          with an API key and returns live widget data as plain JSON for you to render yourself.
        </div>
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">API keys</div>
      <div className="mb-5 rounded-lg border border-border-default bg-bg-1 p-[18px]">
        {project.plan === "free" ? (
          <div className="text-[13px] text-ink-3">Upgrade to Pro or Org to create API keys for the native SDK.</div>
        ) : (
          <>
            {revealedKey && (
              <div className="mb-4 rounded-sm border border-brand-violet bg-surface-selected px-3 py-2.5">
                <div className="mb-1 text-[11px] font-semibold text-ink-1">
                  Copy this key now — it won't be shown again
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="break-all font-mono text-[12px] text-ink-1">{revealedKey}</span>
                  <div
                    onClick={() => {
                      navigator.clipboard?.writeText(revealedKey).catch(() => {});
                      toast("API key copied", "success");
                    }}
                    className="shrink-0 cursor-pointer text-[12px] text-brand-violet-light"
                  >
                    Copy
                  </div>
                </div>
              </div>
            )}

            {(apiKeys ?? []).map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between border-b border-border-subtle py-2.5 text-[13px] last:border-b-0"
              >
                <div>
                  <div className="font-semibold text-ink-1">{k.name}</div>
                  <div className="font-mono text-[11px] text-ink-3">
                    {k.key_prefix}••••••• · {k.revoked_at ? "revoked" : `used ${k.last_used_at ? timeAgo(k.last_used_at) : "never"}`}
                  </div>
                </div>
                {!k.revoked_at && (
                  <div onClick={() => onRevokeKey(k.id)} className="cursor-pointer text-[12px] text-brand-red">
                    Revoke
                  </div>
                )}
              </div>
            ))}

            <div className="mt-3 flex gap-2.5">
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name, e.g. Marketing site"
                className="mt-0 flex-1"
              />
              <Button onClick={onCreateKey} disabled={creatingKey} className="whitespace-nowrap">
                {creatingKey ? "Creating…" : "Create key"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.04em] text-ink-3">
        API reference — raw data access
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default bg-bg-1">
        {API_ROWS.map((row) => (
          <div
            key={row.path}
            className="flex items-center gap-3 border-b border-border-subtle px-[18px] py-3 last:border-b-0"
          >
            <div className="rounded-xs bg-brand-green-surface px-2 py-[3px] text-[10px] font-bold text-brand-green">
              {row.method}
            </div>
            <div className="font-mono text-[12px] text-ink-2">{row.path}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
