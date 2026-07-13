import { Line, LineChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { MetricWidgetType } from "@/types";
import type { ShapedRow } from "@/lib/shapeWidgetData";
import { pickNumber, pickRaw } from "@/lib/shapeWidgetData";

interface MetricWidgetProps {
  metricKind: MetricWidgetType;
  rows: ShapedRow[];
  color?: string;
  unit?: string;
  min?: number;
  max?: number;
  thresholdWarn?: number;
  thresholdCritical?: number;
  trendLabel?: string;
  footer1Label?: string;
  footer2Label?: string;
  compactNumbers?: boolean;
  showValue?: boolean;
}

function formatValue(n: number, unit?: string, compact = true) {
  const rounded =
    compact && Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : (Math.round(n * 10) / 10).toLocaleString();
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
  trendLabel = "vs last period",
  footer1Label,
  footer2Label,
  compactNumbers = true,
  showValue = true,
}: MetricWidgetProps) {
  const value = pickNumber(rows, ["value", "y-axis"], 0);

  if (metricKind === "sparkline") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5">
        {showValue && (
          <div className="font-display text-[28px] font-extrabold" style={{ color }}>
            {formatValue(pickNumber(rows, ["y-axis", "value"], 0), unit, compactNumbers)}
          </div>
        )}
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
          {formatValue(value, unit, compactNumbers)}
        </div>
      </div>
    );
  }

  // stat
  const trend = pickNumber(rows, ["trend"], NaN);
  const hasTrend = !Number.isNaN(trend);
  const footer1Value = footer1Label ? pickRaw(rows, ["footer-value-1"]) : undefined;
  const footer2Value = footer2Label ? pickRaw(rows, ["footer-value-2"]) : undefined;
  const hasFooter = footer1Value !== undefined || footer2Value !== undefined;

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {hasTrend && (
        <div
          className="self-end text-[12px] font-semibold"
          style={{ color: trend >= 0 ? "var(--color-brand-green)" : "var(--color-brand-red)" }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% {trendLabel}
        </div>
      )}
      <div className="flex flex-1 items-center justify-center">
        <div className="font-display text-[44px] font-extrabold" style={{ color }}>
          {formatValue(value, unit, compactNumbers)}
        </div>
      </div>
      {hasFooter && (
        <div className="flex items-stretch gap-3 border-t border-border-subtle pt-2.5">
          {footer1Value !== undefined && (
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wide text-ink-3">{footer1Label}</div>
              <div className="text-[13px] font-semibold text-ink-1">{footer1Value}</div>
            </div>
          )}
          {footer2Value !== undefined && (
            <div className="flex-1 border-l border-border-subtle pl-3">
              <div className="text-[10px] uppercase tracking-wide text-ink-3">{footer2Label}</div>
              <div className="text-[13px] font-semibold text-ink-1">{footer2Value}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
