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
import { nameAxis } from "@aidi-studio/chart-utils";
import type { ChartWidgetType, FieldMapping } from "@/types";
import type { ShapedRow } from "@/lib/shapeWidgetData";

const PALETTE = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#c084fc", "#fb923c"];
const AXIS_STYLE = { fontSize: 10, fill: "var(--color-ink-3)" };
const AXIS_TITLE_STYLE = { fontSize: 10, fill: "var(--color-ink-2)" };

interface ChartWidgetProps {
  chartKind: ChartWidgetType;
  rows: ShapedRow[];
  mapping?: FieldMapping[] | null;
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

/** Human-readable axis titles derived from the resource fields mapped to x-axis/y-axis,
 * e.g. "revenue_usd" -> "Revenue USD" — undefined (no title shown) when nothing is mapped. */
function axisTitles(mapping: FieldMapping[] | null | undefined) {
  const xField = mapping?.find((m) => m.role === "x-axis")?.field;
  const yField = mapping?.find((m) => m.role === "y-axis")?.field;
  return {
    x: xField ? nameAxis(xField) : undefined,
    y: yField ? nameAxis(yField) : undefined,
  };
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
  mapping,
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
  const titles = showAxisLabels ? axisTitles(mapping) : { x: undefined, y: undefined };
  // Label shape depends on which physical axis (horizontal vs vertical) it's attached to,
  // not on which data role it carries — a horizontal bar chart's numeric axis renders along
  // the bottom (y-axis role) while its category axis renders along the left (x-axis role).
  const horizontalAxisLabel = (text: string | undefined) =>
    text ? { value: text, position: "insideBottom" as const, offset: -2, style: AXIS_TITLE_STYLE } : undefined;
  const verticalAxisLabel = (text: string | undefined) =>
    text ? { value: text, angle: -90, position: "insideLeft" as const, style: AXIS_TITLE_STYLE } : undefined;
  const xTitle = horizontalAxisLabel(titles.x);
  const yTitle = verticalAxisLabel(titles.y);
  // The default -20 left margin trims whitespace the y-axis doesn't need, but a rotated
  // axis title needs that room back or it renders past the card's left edge and gets clipped.
  const leftMargin = yTitle ? 0 : -20;
  const yAxisWidth = yTitle ? 44 : 36;
  const bottomMargin = xTitle ? 4 : 0;

  if (chartKind === "line" || chartKind === "area") {
    const Chart = chartKind === "line" ? LineChart : AreaChart;
    const curve = smoothLine ? "monotone" : "linear";
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={rows} margin={{ top: 8, right: 8, left: leftMargin, bottom: bottomMargin }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />}
          <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} label={xTitle} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={yAxisWidth} label={yTitle} />
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
    // Horizontal bars swap which role sits on which physical axis: the numeric y-axis role
    // runs along the bottom and the categorical x-axis role runs along the left.
    const barXTitle = horizontal ? horizontalAxisLabel(titles.y) : xTitle;
    const barYTitle = horizontal ? verticalAxisLabel(titles.x) : yTitle;
    const barLeftMargin = horizontal ? (barYTitle ? 8 : -12) : leftMargin;
    const barYAxisWidth = horizontal ? 72 : yAxisWidth;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, left: barLeftMargin, bottom: barXTitle ? 4 : 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={!horizontal} vertical={horizontal} />
          )}
          {horizontal ? (
            <>
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} label={barXTitle} />
              <YAxis dataKey="x-axis" type="category" tick={axisTick} axisLine={false} tickLine={false} width={barYAxisWidth} label={barYTitle} />
            </>
          ) : (
            <>
              <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} label={barXTitle} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={barYAxisWidth} label={barYTitle} />
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
        <ScatterChart margin={{ top: 8, right: 8, left: leftMargin, bottom: bottomMargin }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />}
          <XAxis dataKey="x-axis" tick={axisTick} axisLine={false} tickLine={false} label={xTitle} />
          <YAxis dataKey="y-axis" tick={axisTick} axisLine={false} tickLine={false} width={yAxisWidth} label={yTitle} />
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
