import type { ApiResource, WidgetFineTune, WidgetType } from "@/types";
import { CHART_TYPES, METRIC_TYPES, requiresResource } from "@/components/widgets/widgetTypeMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmbeddedViewsEditor } from "@/components/widget-builder/EmbeddedViewsEditor";

const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171"];
const REFRESH_OPTIONS = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "300", label: "5 minutes" },
  { value: "900", label: "15 minutes" },
];

interface Step3FineTuneProps {
  type: WidgetType;
  ft: WidgetFineTune;
  resources: ApiResource[];
  onChange: (patch: Partial<WidgetFineTune>) => void;
  onBack: () => void;
  onNext: () => void;
}

function numberOrUndefined(raw: string): number | undefined {
  return raw === "" ? undefined : Number(raw);
}

export function Step3FineTune({ type, ft, resources, onChange, onBack, onNext }: Step3FineTuneProps) {
  const isChart = (CHART_TYPES as WidgetType[]).includes(type);
  const isMetric = (METRIC_TYPES as WidgetType[]).includes(type);
  const isRangeMetric = type === "gauge" || type === "progress";
  const showColor = type !== "text" && type !== "image";

  return (
    <div>
      <div className="flex max-w-[460px] flex-col gap-4">
        <div>
          <Label htmlFor="widget-title">Title</Label>
          <Input id="widget-title" value={ft.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {showColor && (
          <div>
            <Label>Accent color</Label>
            <div className="mt-1.5 flex gap-2">
              {COLORS.map((hex) => (
                <div
                  key={hex}
                  onClick={() => onChange({ color: hex })}
                  className="h-[30px] w-[30px] cursor-pointer rounded-full border-2"
                  style={{ background: hex, borderColor: ft.color === hex ? "#fff" : "transparent" }}
                />
              ))}
            </div>
          </div>
        )}

        {isChart && (
          <>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-1">Show legend</span>
              <Switch checked={ft.showLegend} onCheckedChange={(v) => onChange({ showLegend: v })} />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Show data points</span>
              <Switch checked={ft.showPoints} onCheckedChange={(v) => onChange({ showPoints: v })} />
            </div>
          </>
        )}

        {isMetric && (
          <div>
            <Label htmlFor="widget-unit">Unit (optional)</Label>
            <Input
              id="widget-unit"
              value={ft.unit ?? ""}
              onChange={(e) => onChange({ unit: e.target.value })}
              placeholder="%, $, ms…"
            />
          </div>
        )}

        {isRangeMetric && (
          <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3.5">
            <div>
              <Label htmlFor="widget-min">Min</Label>
              <Input
                id="widget-min"
                type="number"
                value={ft.min ?? 0}
                onChange={(e) => onChange({ min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="widget-max">Max</Label>
              <Input
                id="widget-max"
                type="number"
                value={ft.max ?? 100}
                onChange={(e) => onChange({ max: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="widget-warn">Warn at</Label>
              <Input
                id="widget-warn"
                type="number"
                value={ft.thresholdWarn ?? ""}
                onChange={(e) => onChange({ thresholdWarn: numberOrUndefined(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="widget-critical">Critical at</Label>
              <Input
                id="widget-critical"
                type="number"
                value={ft.thresholdCritical ?? ""}
                onChange={(e) => onChange({ thresholdCritical: numberOrUndefined(e.target.value) })}
              />
            </div>
          </div>
        )}

        {type === "table" && (
          <div>
            <Label htmlFor="widget-pagesize">Rows per page</Label>
            <Input
              id="widget-pagesize"
              type="number"
              min={1}
              value={ft.pageSize ?? 5}
              onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
            />
          </div>
        )}

        {type === "text" && (
          <div>
            <Label htmlFor="widget-body">Content</Label>
            <Textarea id="widget-body" rows={5} value={ft.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} />
          </div>
        )}

        {type === "image" && (
          <div>
            <Label htmlFor="widget-image">Image URL</Label>
            <Input
              id="widget-image"
              value={ft.imageUrl ?? ""}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
        )}

        {(type === "button" || type === "modal") && (
          <div>
            <Label htmlFor="widget-button-label">Button label</Label>
            <Input
              id="widget-button-label"
              value={ft.buttonLabel ?? ""}
              onChange={(e) => onChange({ buttonLabel: e.target.value })}
            />
          </div>
        )}

        {type === "button" && (
          <div>
            <Label htmlFor="widget-button-url">Link URL</Label>
            <Input
              id="widget-button-url"
              value={ft.buttonUrl ?? ""}
              onChange={(e) => onChange({ buttonUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
        )}

        {type === "container" && (
          <div>
            <Label htmlFor="widget-description">Description (optional)</Label>
            <Textarea
              id="widget-description"
              rows={2}
              value={ft.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
        )}

        {type === "tabs" && (
          <div>
            <Label>Tabs</Label>
            <div className="mt-1.5">
              <EmbeddedViewsEditor views={ft.views ?? []} resources={resources} onChange={(views) => onChange({ views })} />
            </div>
          </div>
        )}

        {type === "modal" && (
          <div>
            <Label>Detail view</Label>
            <div className="mt-1.5">
              <EmbeddedViewsEditor
                views={ft.views ?? []}
                resources={resources}
                maxViews={1}
                onChange={(views) => onChange({ views })}
              />
            </div>
          </div>
        )}

        {requiresResource(type) && (
          <div className="border-t border-border-subtle pt-3.5">
            <Label htmlFor="widget-refresh">Refresh interval</Label>
            <Select value={String(ft.refreshInterval)} onValueChange={(v) => onChange({ refreshInterval: Number(v) })}>
              <SelectTrigger id="widget-refresh">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-[30px] flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext}>Preview →</Button>
      </div>
    </div>
  );
}
