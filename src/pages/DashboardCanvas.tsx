import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboards } from "@/data/dashboards";
import { widgets as allWidgets, widgetTemplates } from "@/data/widgets";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Search, Plus, GripVertical, MoreVertical, Copy, Rocket,
  Check, Globe, Code2, LayoutTemplate,
} from "lucide-react";

export default function DashboardCanvas() {
  const { projectId = "marketing-analytics", dashboardId } = useParams();
  const navigate = useNavigate();
  const dashboard = dashboards.find((d) => d.id === dashboardId) ?? dashboards[0];

  const [placedIds, setPlacedIds] = useState<string[]>(dashboard.widgetIds);
  const [status, setStatus] = useState(dashboard.status);
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const placedWidgets = useMemo(
    () => placedIds.map((id) => allWidgets.find((w) => w.id === id)!).filter(Boolean),
    [placedIds]
  );
  const availableWidgets = allWidgets.filter((w) => !placedIds.includes(w.id));

  const addWidget = (id: string) => setPlacedIds((prev) => [...prev, id]);
  const removeWidget = (id: string) => setPlacedIds((prev) => prev.filter((w) => w !== id));

  const copyText = (label: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  };

  const publicUrl = `app.aidistudio.com/d/${dashboard.slug}`;
  const embedCode = `<iframe src="https://${publicUrl.replace("d/", "embed/")}"\n  width="100%" height="600"\n  frameborder="0"></iframe>`;

  return (
    <div className="flex h-screen flex-col bg-bg-0">
      <div className="flex h-13 items-center gap-3 border-b border-border bg-bg-1 px-4 py-2.5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink-1">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-semibold text-ink-1">{dashboard.name}</span>
        <Badge variant={status === "published" ? "green" : "amber"}>
          {status === "published" ? "● Published" : "○ Draft"}
        </Badge>
        <span className="text-[10px] text-ink-3">✓ Saved 2s ago</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm">Preview</Button>
          <Button variant="secondary" size="sm" onClick={() => copyText("share", `https://${publicUrl}`)}>
            {copied === "share" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Share link
          </Button>
          <Button size="sm" onClick={() => setPublishOpen(true)}>
            <Rocket className="h-3.5 w-3.5" /> {status === "published" ? "Manage publish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-bg-1 p-4">
          <div className="mb-1 text-sm font-semibold text-ink-1">Widget Library</div>
          <div className="mb-3 text-[11px] text-ink-3">Click to add to canvas, or create new</div>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
            <Input placeholder="Search widgets..." className="h-8 pl-8 text-xs" />
          </div>

          <div className="space-y-2">
            {availableWidgets.map((w) => (
              <button
                key={w.id}
                onClick={() => addWidget(w.id)}
                className="flex w-full items-center gap-2 rounded-md border border-border bg-bg-2 p-2.5 text-left transition-colors hover:border-brand-violet/40"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-ink-1">{w.name}</div>
                  <Badge className="mt-1">{w.type}</Badge>
                </div>
                <Plus className="h-3.5 w-3.5 shrink-0 text-brand-violetLight" />
              </button>
            ))}
            {availableWidgets.length === 0 && (
              <div className="rounded-md border border-dashed border-border-strong p-4 text-center text-[11px] text-ink-3">
                All library widgets are on this dashboard.
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(`/app/projects/${projectId}/widgets/new`)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-brand-violet/25 bg-brand-violet/8 p-3 text-xs font-medium text-brand-violetLight hover:bg-brand-violet/12"
          >
            <Plus className="h-3.5 w-3.5" /> Create new widget
          </button>

          <div className="mb-2 mt-6 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
            <LayoutTemplate className="h-3 w-3" /> Templates
          </div>
          <div className="space-y-2">
            {widgetTemplates.map((t) => (
              <div key={t.id} className="rounded-md border border-border bg-bg-2 p-2.5">
                <div className="text-xs font-medium text-ink-1">{t.name}</div>
                <Badge className="mt-1">Template</Badge>
              </div>
            ))}
          </div>
        </aside>

        <div className="grid-dots flex-1 overflow-y-auto p-5">
          {placedWidgets.length === 0 ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-violet/30 bg-brand-violet/5 text-brand-violetLight">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add your first widget</span>
              <span className="text-xs text-ink-3">Click any widget in the library panel</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {placedWidgets.map((w) => (
                <div key={w.id} className={`rounded-lg border border-border bg-bg-1 ${w.type === "table" || w.type === "line" ? "sm:col-span-2" : ""}`}>
                  <div className="flex h-9 items-center gap-2 border-b border-border bg-bg-2 px-3">
                    <GripVertical className="h-3.5 w-3.5 cursor-grab text-ink-3" />
                    <span className="flex-1 truncate text-xs font-medium text-ink-1">{w.name}</span>
                    <button onClick={() => removeWidget(w.id)} className="text-ink-3 hover:text-brand-red">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <WidgetRenderer widget={w} />
                  </div>
                </div>
              ))}
              <button
                onClick={() => document.querySelector<HTMLInputElement>("aside input")?.focus()}
                className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-ink-3 transition-colors hover:border-brand-violet/40 hover:text-brand-violetLight"
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Drop widget here</span>
                <span className="text-[10px]">or pick one from the library</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between rounded-md border border-border bg-bg-2 p-3">
              <div>
                <div className="text-sm font-medium text-ink-1">{dashboard.name}</div>
                <div className="text-[10px] text-ink-3">{placedWidgets.length} widgets &middot; Draft → Published</div>
              </div>
              <Badge variant="amber">Draft → Published</Badge>
            </div>

            <div className="space-y-3">
              {[
                { icon: Globe, title: "Public URL goes live", desc: "Anyone with the link can view — no login needed", color: "text-brand-green" },
                { icon: Code2, title: "Embed anywhere", desc: "iFrame snippet and React SDK become available", color: "text-brand-cyan" },
                { icon: Check, title: "Data stays protected", desc: "API keys never exposed — calls proxied server-side", color: "text-brand-violetLight" },
              ].map((item) => (
                <div key={item.title} className="flex gap-2.5">
                  <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} />
                  <div>
                    <div className="text-[13px] font-medium text-ink-1">{item.title}</div>
                    <div className="text-[11px] text-ink-3">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">Public URL</div>
              <div className="flex items-center justify-between rounded-md border border-border-strong bg-bg-3 p-2.5">
                <span className="truncate text-[11px] text-brand-cyan">{publicUrl}</span>
                <button onClick={() => copyText("url", `https://${publicUrl}`)} className="shrink-0 rounded-md border border-border-strong bg-bg-2 px-2.5 py-1 text-[10px] text-ink-2">
                  {copied === "url" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">Embed code</div>
              <div className="relative rounded-md border border-border-strong bg-[#08080f] p-3">
                <pre className="whitespace-pre-wrap text-[10px] leading-relaxed text-brand-green">{embedCode}</pre>
                <button onClick={() => copyText("embed", embedCode)} className="absolute bottom-2.5 right-2.5 rounded-md border border-border-strong bg-bg-2 px-2.5 py-1 text-[10px] text-ink-2">
                  {copied === "embed" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between">
              <span className="text-[12px] text-ink-2">Allow viewers to change filters</span>
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[12px] text-ink-2">Show AiDi Studio branding</span>
              <Switch />
            </label>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>Keep as draft</Button>
            <Button
              onClick={() => {
                setStatus("published");
                setPublishOpen(false);
              }}
            >
              <Rocket className="h-4 w-4" /> Publish now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
