import type { WidgetFineTune } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171"];
const REFRESH_OPTIONS = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "300", label: "5 minutes" },
  { value: "900", label: "15 minutes" },
];

interface Step3FineTuneProps {
  ft: WidgetFineTune;
  onTitleChange: (title: string) => void;
  onColorChange: (hex: string) => void;
  onToggleLegend: () => void;
  onTogglePoints: () => void;
  onRefreshChange: (interval: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step3FineTune({
  ft,
  onTitleChange,
  onColorChange,
  onToggleLegend,
  onTogglePoints,
  onRefreshChange,
  onBack,
  onNext,
}: Step3FineTuneProps) {
  return (
    <div>
      <div className="flex max-w-[460px] flex-col gap-4">
        <div>
          <Label htmlFor="widget-title">Title</Label>
          <Input id="widget-title" value={ft.title} onChange={(e) => onTitleChange(e.target.value)} />
        </div>

        <div>
          <Label>Accent color</Label>
          <div className="mt-1.5 flex gap-2">
            {COLORS.map((hex) => (
              <div
                key={hex}
                onClick={() => onColorChange(hex)}
                className="h-[30px] w-[30px] cursor-pointer rounded-full border-2"
                style={{ background: hex, borderColor: ft.color === hex ? "#fff" : "transparent" }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-[13px] text-ink-1">Show legend</span>
          <Switch checked={ft.showLegend} onCheckedChange={onToggleLegend} />
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle py-2.5">
          <span className="text-[13px] text-ink-1">Show data points</span>
          <Switch checked={ft.showPoints} onCheckedChange={onTogglePoints} />
        </div>

        <div className="border-t border-border-subtle pt-3.5">
          <Label htmlFor="widget-refresh">Refresh interval</Label>
          <Select value={String(ft.refreshInterval)} onValueChange={(v) => onRefreshChange(Number(v))}>
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
