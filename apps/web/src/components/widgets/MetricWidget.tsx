import { Line, LineChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { MetricWidgetType } from "@/types";
import type { ShapedRow } from "@/lib/shapeWidgetData";
import { pickNumber } from "@/lib/shapeWidgetData";

interface MetricWidgetProps {
  metricKind: MetricWidgetType;
  rows: ShapedRow[];
  color?: string;
  unit?: string;
  min?: number;
  max?: number;
  thresholdWarn?: number;
  thresholdCritical?: number;
}

function formatValue(n: number, unit?: string) {
  const rounded = Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n * 10) / 10);
  return unit ? `${rounded}${unit}` : rounded;
}

function statusColor(value: number, warn: number | undefined, critical: number | undefined, fallback: string) {
  if (critical !== undefined && value >= critical) return "#f87171";
  if (warn !== undefined && value >= warn) return "#fbbf24";
  return fallback;
}

export function MetricWidget({
  metricKind,
  rows,
  color = "#8b5cf6",
  unit,
  min = 0,
  max = 100,
  thresholdWarn,
  thresholdCritical,
}: MetricWidgetProps) {
  const value = pickNumber(rows, ["value", "y-axis"], 0);

  if (metricKind === "sparkline") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5">
        <div className="font-display text-[28px] font-extrabold" style={{ color }}>
          {formatValue(pickNumber(rows, ["y-axis", "value"], 0), unit)}
        </div>
        <div className="h-[46px] w-full px-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <Line type="monotone" dataKey="y-axis" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (metricKind === "progress") {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min || 1)) * 100));
    const fill = statusColor(value, thresholdWarn, thresholdCritical, color);
    return (
      <div className="flex h-full flex-col justify-center gap-2 px-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-ink-2">Progress</span>
          <span className="font-display text-[20px] font-bold" style={{ color: fill }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
        </div>
      </div>
    );
  }

  if (metricKind === "gauge") {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min || 1)) * 100));
    const fill = statusColor(value, thresholdWarn, thresholdCritical, color);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1">
        <div className="h-[65%] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="95%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={12}
              startAngle={180}
              endAngle={0}
              data={[{ value: pct, fill }]}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--color-border-strong)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="font-display text-[22px] font-extrabold" style={{ color: fill }}>
          {formatValue(value, unit)}
        </div>
      </div>
    );
  }

  // stat
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="font-display text-[44px] font-extrabold" style={{ color }}>
        {formatValue(value, unit)}
      </div>
      <div className="text-[12px] text-brand-green">▲ 8.2% vs last period</div>
    </div>
  );
}
