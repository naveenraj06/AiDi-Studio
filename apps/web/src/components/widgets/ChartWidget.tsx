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
  showTooltip?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showAxisLabels?: boolean;
  smoothLine?: boolean;
  asPie?: boolean;
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

export function ChartWidget({
  chartKind,
  rows,
  color = "#8b5cf6",
  showLegend = true,
  showPoints = true,
  showTooltip = true,
  horizontal = false,
  showGrid = true,
  showAxisLabels = true,
  smoothLine = true,
  asPie = false,
}: ChartWidgetProps) {
  if (rows.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No data yet</div>;
  }

  const axisTick = showAxisLabels ? AXIS_STYLE : false;

  if (chartKind === "line" || chartKind === "area") {
    const Chart = chartKind === "line" ? LineChart : AreaChart;
    const curve = smoothLine ? "monotone" : "linear";
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />}
          <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
          {showTooltip && <Tooltip />}
          {chartKind === "line" ? (
            <Line type={curve} dataKey="y-axis" stroke={color} strokeWidth={2.5} dot={showPoints} />
          ) : (
            <Area type={curve} dataKey="y-axis" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2.5} dot={showPoints} />
          )}
        </Chart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "bar" || chartKind === "stacked-bar") {
    const { data, seriesKeys } = chartKind === "stacked-bar" ? pivotBySeries(rows) : { data: rows, seriesKeys: ["y-axis"] };
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, left: horizontal ? 8 : -20, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={!horizontal} vertical={horizontal} />
          )}
          {horizontal ? (
            <>
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis dataKey="x-axis" type="category" tick={axisTick} axisLine={false} tickLine={false} width={72} />
            </>
          ) : (
            <>
              <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
            </>
          )}
          {showTooltip && <Tooltip />}
          {showLegend && seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {seriesKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={chartKind === "stacked-bar" ? "s" : undefined}
              fill={i === 0 ? color : PALETTE[i % PALETTE.length]}
              radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
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
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />}
          <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis dataKey="y-axis" tick={axisTick} axisLine={false} tickLine={false} width={36} />
          {showTooltip && <Tooltip />}
          <Scatter data={rows} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "radar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows}>
          {showGrid && <PolarGrid stroke="var(--color-border-subtle)" />}
          <PolarAngleAxis dataKey="x-axis" tick={axisTick} />
          <PolarRadiusAxis tick={axisTick} />
          {showTooltip && <Tooltip />}
          <Radar dataKey="y-axis" stroke={color} fill={color} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  if (chartKind === "donut") {
    const total = rows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="label" innerRadius={asPie ? "0%" : "55%"} outerRadius="85%" paddingAngle={2}>
                {rows.map((row, i) => (
                  <Cell key={`${row.label ?? i}`} fill={i === 0 ? color : PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
        </div>
        {showLegend && (
          <div className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1">
            {rows.map((row, i) => {
              const pct = total > 0 ? Math.round(((Number(row.value) || 0) / total) * 100) : 0;
              return (
                <div key={`${row.label ?? i}`} className="flex items-center gap-1.5 text-[11px] text-ink-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: i === 0 ? color : PALETTE[i % PALETTE.length] }}
                  />
                  {row.label} <span className="text-ink-3">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        <Treemap data={data} dataKey="size" stroke="var(--color-bg-1)" fill={color}>
          {showTooltip && <Tooltip />}
        </Treemap>
      </ResponsiveContainer>
    );
  }

  // funnel
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        {showTooltip && <Tooltip />}
        <Funnel data={rows} dataKey="value" nameKey="label" isAnimationActive={false}>
          {rows.map((row, i) => (
            <Cell key={`${row.label ?? i}`} fill={i === 0 ? color : PALETTE[i % PALETTE.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
