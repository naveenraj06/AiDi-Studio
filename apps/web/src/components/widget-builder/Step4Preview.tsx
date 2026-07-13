import type { WidgetCategory, WidgetFineTune, WidgetType } from "@/types";
import { CATEGORY_LABEL, WIDGET_CATEGORIES } from "@/components/widgets/widgetTypeMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface Step4PreviewProps {
  projectId: string;
  type: WidgetType;
  resourceId: string | null;
  mapping: { field: string; role: string }[] | undefined;
  ft: WidgetFineTune;
  saveAsTemplate: boolean;
  category: WidgetCategory | null;
  saving?: boolean;
  onToggleTemplate: () => void;
  onCategoryChange: (category: WidgetCategory) => void;
  onBack: () => void;
  onSave: () => void;
}

export function Step4Preview({
  projectId,
  type,
  resourceId,
  mapping,
  ft,
  saveAsTemplate,
  category,
  saving,
  onToggleTemplate,
  onCategoryChange,
  onBack,
  onSave,
}: Step4PreviewProps) {
  return (
    <div>
      <Card className="mb-5">
        <div className="mb-3.5 text-[13px] font-semibold text-ink-1">{ft.title}</div>
        <div className="h-[220px]">
          <WidgetRenderer type={type} projectId={projectId} resourceId={resourceId} mapping={mapping} ft={ft} />
        </div>
      </Card>

      <div className="flex items-center gap-2.5 py-3">
        <Checkbox checked={saveAsTemplate} onCheckedChange={onToggleTemplate} />
        <span className="text-[13px] text-ink-1">Also save as a reusable template</span>
      </div>

      {saveAsTemplate && (
        <div className="max-w-[280px] pb-3">
          <Select value={category ?? "generic"} onValueChange={(v) => onCategoryChange(v as WidgetCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {WIDGET_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-5 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="success" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save widget"}
        </Button>
      </div>
    </div>
  );
}
