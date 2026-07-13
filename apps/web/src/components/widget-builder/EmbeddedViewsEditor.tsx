import type { ApiResource, EmbeddedView, WidgetType } from "@/types";
import { CHART_TYPES, DATA_TYPES, METRIC_TYPES, TYPE_LABEL } from "@/components/widgets/widgetTypeMeta";
import { suggestFor } from "@/components/widget-builder/suggestFor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMBEDDABLE_TYPES: WidgetType[] = [...CHART_TYPES, ...METRIC_TYPES, ...DATA_TYPES];

interface EmbeddedViewsEditorProps {
  views: EmbeddedView[];
  resources: ApiResource[];
  maxViews?: number;
  onChange: (views: EmbeddedView[]) => void;
}

/** Sub-view editor shared by the Tabs (multiple views) and Modal (single view) fine-tune forms. */
export function EmbeddedViewsEditor({ views, resources, maxViews, onChange }: EmbeddedViewsEditorProps) {
  const addView = () => {
    const resource = resources[0];
    onChange([
      ...views,
      {
        label: `View ${views.length + 1}`,
        type: "table",
        resourceId: resource?.id ?? null,
        mapping: resource ? suggestFor(resource).mapping : [],
      },
    ]);
  };

  const updateView = (i: number, patch: Partial<EmbeddedView>) => {
    const next = [...views];
    const current = next[i];
    let mapping = current.mapping;
    if (patch.resourceId !== undefined && patch.resourceId !== current.resourceId) {
      const resource = resources.find((r) => r.id === patch.resourceId);
      mapping = resource ? suggestFor(resource).mapping : [];
    }
    next[i] = { ...current, ...patch, mapping };
    onChange(next);
  };

  const removeView = (i: number) => onChange(views.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2.5">
      {views.map((v, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sunken p-3">
          <div className="flex items-center gap-2">
            <Input
              value={v.label}
              onChange={(e) => updateView(i, { label: e.target.value })}
              placeholder="Label"
              className="mt-0 flex-1"
            />
            <div onClick={() => removeView(i)} className="cursor-pointer px-1.5 text-[12px] text-ink-3 hover:text-brand-red">
              ✕
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={v.type} onValueChange={(val) => updateView(i, { type: val as WidgetType })}>
              <SelectTrigger className="mt-0 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMBEDDABLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={v.resourceId ?? undefined} onValueChange={(val) => updateView(i, { resourceId: val })}>
              <SelectTrigger className="mt-0 flex-1">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      {(!maxViews || views.length < maxViews) && (
        <Button variant="outline" size="sm" onClick={addView} disabled={resources.length === 0}>
          + Add {maxViews === 1 ? "view" : "tab"}
        </Button>
      )}
      {resources.length === 0 && (
        <div className="text-[11px] text-ink-3">Add an API resource to this project first.</div>
      )}
    </div>
  );
}
