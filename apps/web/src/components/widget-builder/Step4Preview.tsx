import type { WidgetFineTune, WidgetType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface Step4PreviewProps {
  ft: WidgetFineTune;
  chosenType: WidgetType;
  saveAsTemplate: boolean;
  onToggleTemplate: () => void;
  onBack: () => void;
  onSave: () => void;
}

export function Step4Preview({ ft, chosenType, saveAsTemplate, onToggleTemplate, onBack, onSave }: Step4PreviewProps) {
  return (
    <div>
      <Card className="mb-5">
        <div className="mb-3.5 text-[13px] font-semibold text-ink-1">{ft.title}</div>
        <div className="h-[220px]">
          <WidgetRenderer type={chosenType} color={ft.color} showLegend={ft.showLegend} showPoints={ft.showPoints} />
        </div>
      </Card>

      <div className="flex items-center gap-2.5 py-3">
        <Checkbox checked={saveAsTemplate} onCheckedChange={onToggleTemplate} />
        <span className="text-[13px] text-ink-1">Also save as a reusable template</span>
      </div>

      <div className="mt-5 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="success" onClick={onSave}>
          Save widget
        </Button>
      </div>
    </div>
  );
}
