import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartWidgetType } from "@/types";
import type { ShapedRow } from "@/lib/shapeWidgetData";

const PALETTE = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#c084fc", "#fb923c"];
const AXIS_STYLE = { fontSize: 10, fill: "var(--color-ink-3)" };

interface ChartWidgetProps {
  chartKind: ChartWidgetType;
  rows: ShapedRow[];
  color?: string;
  showLegend?: boolean;
  showPoints?: boolean;
}

/** Pivots long-format {x-axis, y-axis, series} rows into one column per series, for stacked/grouped bars. */
function pivotBySeries(rows: ShapedRow[]) {
  const hasSeries = rows.some((r) => r.series !== undefined);
  if (!hasSeries) return { data: rows, seriesKeys: ["y-axis"] };

  const byX = new Map<string, ShapedRow>();
  const seriesKeys: string[] = [];
  for (const row of rows) {
    const x = String(row["x-axis"] ?? "");
    const seriesName = String(row.series ?? "series");
    if (!seriesKeys.includes(seriesName)) seriesKeys.push(seriesName);
    const existing = byX.get(x) ?? { "x-axis": row["x-axis"] ?? x };
    existing[seriesName] = row["y-axis"];
    byX.set(x, existing);
  }
  return { data: [...byX.values()], seriesKeys };
}

export function ChartWidget({ chartKind, rows, color = "#8b5cf6", showLegend = true, showPoints = true }: ChartWidgetProps) {
  if (rows.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  if (chartKind === "line" || chartKind === "area") {
    const Chart = chartKind === "line" ? LineChart : AreaChart;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis dataKey="x-axis" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
          <Tooltip />
          {chartKind === "line" ? (
            <Line type="monotone" dataKey="y-axis" stroke={color} strokeWidth={2.5} dot={showPoints} />
          ) : (
            <Area type="monotone" dataKey="y-axis" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2.5} dot={showPoints} />
          )}
        </Chart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "bar" || chartKind === "stacked-bar") {
    const { data, seriesKeys } = chartKind === "stacked-bar" ? pivotBySeries(rows) : { data: rows, seriesKeys: ["y-axis"] };
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis dataKey="x-axis" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
          <Tooltip />
          {showLegend && seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {seriesKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={chartKind === "stacked-bar" ? "s" : undefined}
              fill={i === 0 ? color : PALETTE[i % PALETTE.length]}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "scatter") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis dataKey="x-axis" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis dataKey="y-axis" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
          <Tooltip />
          <Scatter data={rows} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "radar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--color-border-subtle)" />
          <PolarAngleAxis dataKey="x-axis" tick={AXIS_STYLE} />
          <PolarRadiusAxis tick={AXIS_STYLE} />
          <Radar dataKey="y-axis" stroke={color} fill={color} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "donut") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {rows.map((row, i) => (
              <Cell key={`${row.label ?? i}`} fill={i === 0 ? color : PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "treemap") {
    const data = rows.map((row, i) => ({
      name: String(row.label ?? row["x-axis"] ?? i),
      size: Number(row.value ?? row["y-axis"] ?? 0),
      fill: i === 0 ? color : PALETTE[i % PALETTE.length],
    }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={data} dataKey="size" stroke="var(--color-bg-1)" fill={color} />
      </ResponsiveContainer>
    );
  }

  // funnel
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip />
        <Funnel data={rows} dataKey="value" nameKey="label" isAnimationActive={false}>
          {rows.map((row, i) => (
            <Cell key={`${row.label ?? i}`} fill={i === 0 ? color : PALETTE[i % PALETTE.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
