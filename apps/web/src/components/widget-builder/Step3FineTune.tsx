import type { ApiResource, FieldMapping, WidgetFineTune, WidgetType } from "@/types";
import { CHART_TYPES, METRIC_TYPES, requiresResource } from "@/components/widgets/widgetTypeMeta";
import { nameAxis } from "@/lib/axisName";
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
  mapping: FieldMapping[];
  onChange: (patch: Partial<WidgetFineTune>) => void;
  onBack: () => void;
  onNext: () => void;
}

function numberOrUndefined(raw: string): number | undefined {
  return raw === "" ? undefined : Number(raw);
}

export function Step3FineTune({ type, ft, resources, mapping, onChange, onBack, onNext }: Step3FineTuneProps) {
  const isChart = (CHART_TYPES as WidgetType[]).includes(type);
  const isMetric = (METRIC_TYPES as WidgetType[]).includes(type);
  const isRangeMetric = type === "gauge" || type === "progress";
  const showColor = type !== "text" && type !== "image";
  const showSubtitle = requiresResource(type) && !isMetric;
  const isBar = type === "bar" || type === "stacked-bar";
  const isCartesian = isBar || type === "line" || type === "area" || type === "scatter";
  const isLineOrArea = type === "line" || type === "area";
  const mappedXField = mapping.find((m) => m.role === "x-axis")?.field;
  const mappedYField = mapping.find((m) => m.role === "y-axis")?.field;

  return (
    <div>
      <div className="flex max-w-[460px] flex-col gap-4">
        <div>
          <Label htmlFor="widget-title">Title</Label>
          <Input id="widget-title" value={ft.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {showSubtitle && (
          <div>
            <Label htmlFor="widget-subtitle">Subtitle (optional)</Label>
            <Input
              id="widget-subtitle"
              value={ft.subtitle ?? ""}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Shown under the title on the dashboard card"
            />
          </div>
        )}

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
              <span className="text-[13px] text-ink-1">Show tooltip</span>
              <Switch checked={ft.showTooltip} onCheckedChange={(v) => onChange({ showTooltip: v })} />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Show legend</span>
              <Switch checked={ft.showLegend} onCheckedChange={(v) => onChange({ showLegend: v })} />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Show data points</span>
              <Switch checked={ft.showPoints} onCheckedChange={(v) => onChange({ showPoints: v })} />
            </div>
            {isBar && (
              <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                <span className="text-[13px] text-ink-1">Horizontal bars</span>
                <Switch checked={ft.horizontal ?? false} onCheckedChange={(v) => onChange({ horizontal: v })} />
              </div>
            )}
            {isCartesian && (
              <>
                <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                  <span className="text-[13px] text-ink-1">Show gridlines</span>
                  <Switch checked={ft.showGrid ?? true} onCheckedChange={(v) => onChange({ showGrid: v })} />
                </div>
                <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                  <span className="text-[13px] text-ink-1">Show axis labels</span>
                  <Switch checked={ft.showAxisLabels ?? true} onCheckedChange={(v) => onChange({ showAxisLabels: v })} />
                </div>
                {(ft.showAxisLabels ?? true) && (
                  <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3.5">
                    <div>
                      <Label htmlFor="widget-x-axis-label">X-axis title</Label>
                      <Input
                        id="widget-x-axis-label"
                        value={ft.xAxisLabel ?? ""}
                        onChange={(e) => onChange({ xAxisLabel: e.target.value })}
                        placeholder={mappedXField ? nameAxis(mappedXField) : "Auto"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="widget-y-axis-label">Y-axis title</Label>
                      <Input
                        id="widget-y-axis-label"
                        value={ft.yAxisLabel ?? ""}
                        onChange={(e) => onChange({ yAxisLabel: e.target.value })}
                        placeholder={mappedYField ? nameAxis(mappedYField) : "Auto"}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {isLineOrArea && (
              <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                <span className="text-[13px] text-ink-1">Smooth curve</span>
                <Switch checked={ft.smoothLine ?? true} onCheckedChange={(v) => onChange({ smoothLine: v })} />
              </div>
            )}
            {type === "donut" && (
              <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                <span className="text-[13px] text-ink-1">Solid pie (no center hole)</span>
                <Switch checked={ft.asPie ?? false} onCheckedChange={(v) => onChange({ asPie: v })} />
              </div>
            )}
          </>
        )}

        {type === "map" && (
          <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
            <span className="text-[13px] text-ink-1">Show legend</span>
            <Switch checked={ft.showLegend} onCheckedChange={(v) => onChange({ showLegend: v })} />
          </div>
        )}

        {type === "list" && (
          <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
            <span className="text-[13px] text-ink-1">Show percentage of total</span>
            <Switch checked={ft.showPercentage ?? true} onCheckedChange={(v) => onChange({ showPercentage: v })} />
          </div>
        )}

        {isMetric && (
          <>
            <div>
              <Label htmlFor="widget-unit">Unit (optional)</Label>
              <Input
                id="widget-unit"
                value={ft.unit ?? ""}
                onChange={(e) => onChange({ unit: e.target.value })}
                placeholder="%, $, ms…"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Compact numbers (18.2k vs 18,200)</span>
              <Switch checked={ft.compactNumbers ?? true} onCheckedChange={(v) => onChange({ compactNumbers: v })} />
            </div>
            {type === "sparkline" && (
              <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
                <span className="text-[13px] text-ink-1">Show value above line</span>
                <Switch checked={ft.showValue ?? true} onCheckedChange={(v) => onChange({ showValue: v })} />
              </div>
            )}
          </>
        )}

        {type === "stat" && (
          <div className="flex flex-col gap-3 border-t border-border-subtle pt-3.5">
            <div className="text-[11px] text-ink-3">
              Trend and footer stats only show up if the resource has extra numeric fields beyond the headline value —
              these are just their captions.
            </div>
            <div>
              <Label htmlFor="widget-trend-label">Trend caption</Label>
              <Input
                id="widget-trend-label"
                value={ft.trendLabel ?? ""}
                onChange={(e) => onChange({ trendLabel: e.target.value })}
                placeholder="vs last period"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="widget-footer1-label">Footer stat 1 (optional)</Label>
                <Input
                  id="widget-footer1-label"
                  value={ft.footer1Label ?? ""}
                  onChange={(e) => onChange({ footer1Label: e.target.value })}
                  placeholder="e.g. Fleet coverage"
                />
              </div>
              <div>
                <Label htmlFor="widget-footer2-label">Footer stat 2 (optional)</Label>
                <Input
                  id="widget-footer2-label"
                  value={ft.footer2Label ?? ""}
                  onChange={(e) => onChange({ footer2Label: e.target.value })}
                  placeholder="e.g. Due in 30 days"
                />
              </div>
            </div>
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
          <>
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
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Striped rows</span>
              <Switch checked={ft.stripedRows ?? false} onCheckedChange={(v) => onChange({ stripedRows: v })} />
            </div>
          </>
        )}

        {type === "text" && (
          <>
            <div>
              <Label htmlFor="widget-body">Content</Label>
              <Textarea id="widget-body" rows={5} value={ft.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} />
            </div>
            <div>
              <Label>Alignment</Label>
              <Select value={ft.align ?? "left"} onValueChange={(v) => onChange({ align: v as WidgetFineTune["align"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === "image" && (
          <>
            <div>
              <Label htmlFor="widget-image">Image URL</Label>
              <Input
                id="widget-image"
                value={ft.imageUrl ?? ""}
                onChange={(e) => onChange({ imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label>Fit</Label>
              <Select value={ft.fit ?? "cover"} onValueChange={(v) => onChange({ fit: v as WidgetFineTune["fit"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (fill, may crop)</SelectItem>
                  <SelectItem value="contain">Contain (fit whole image)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === "divider" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-1">Dashed line</span>
            <Switch checked={ft.dashed ?? false} onCheckedChange={(v) => onChange({ dashed: v })} />
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
          <>
            <div>
              <Label htmlFor="widget-button-url">Link URL</Label>
              <Input
                id="widget-button-url"
                value={ft.buttonUrl ?? ""}
                onChange={(e) => onChange({ buttonUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
              <span className="text-[13px] text-ink-1">Open in new tab</span>
              <Switch checked={ft.openInNewTab ?? true} onCheckedChange={(v) => onChange({ openInNewTab: v })} />
            </div>
          </>
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
