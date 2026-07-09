import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Widget } from "@/data/types";
import { sampleTimeSeries, sampleBarData, sampleDonutData, sampleTableRows } from "@/data/widgets";
import { MapPin } from "lucide-react";

const CHART_COLORS = ["#7D5AFF", "#33D1EE", "#FEBF33", "#20D491"];

const tooltipStyle = {
  background: "#1C1C23",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontSize: 11,
  color: "#F2F2F4",
};

export function WidgetRenderer({ widget, compact = false }: { widget: Widget; compact?: boolean }) {
  switch (widget.type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={compact ? 90 : 220}>
          <LineChart data={sampleTimeSeries} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            {!compact && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />}
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} hide={compact} />
            <YAxis tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} hide={compact} />
            {!compact && <Tooltip contentStyle={tooltipStyle} />}
            <Line type="monotone" dataKey="revenue" stroke="#7D5AFF" strokeWidth={2} dot={!compact} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "bar":
      return (
        <ResponsiveContainer width="100%" height={compact ? 90 : 220}>
          <BarChart data={sampleBarData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            {!compact && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />}
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} hide={compact} />
            <YAxis tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} hide={compact} />
            {!compact && <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />}
            <Bar dataKey="units" fill="#33D1EE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case "donut":
      return (
        <ResponsiveContainer width="100%" height={compact ? 90 : 220}>
          <PieChart>
            <Pie data={sampleDonutData} dataKey="value" nameKey="name" innerRadius={compact ? 24 : 55} outerRadius={compact ? 38 : 85} paddingAngle={2}>
              {sampleDonutData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            {!compact && <Tooltip contentStyle={tooltipStyle} />}
          </PieChart>
        </ResponsiveContainer>
      );
    case "stat": {
      const value = widget.name.includes("Revenue") ? "$98,346" : widget.name.includes("Active") ? "12,438" : "3.8%";
      const delta = widget.name.includes("Conversion") ? "-0.4%" : "+12.4%";
      const isUp = !delta.startsWith("-");
      return (
        <div className="flex h-full flex-col justify-center gap-1 px-1">
          <div className={compact ? "text-lg font-bold text-ink-1" : "text-2xl font-bold text-ink-1"}>{value}</div>
          <div className={cnDelta(isUp)}>{delta} vs last period</div>
        </div>
      );
    }
    case "table":
      return (
        <div className="overflow-hidden rounded-md">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-border text-ink-3">
                <th className="py-1.5 font-medium">Name</th>
                <th className="py-1.5 font-medium">Plan</th>
                <th className="py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleTableRows.slice(0, compact ? 3 : 4).map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="py-1.5 text-ink-1">{row.name}</td>
                  <td className="py-1.5 text-ink-2">{row.plan}</td>
                  <td className="py-1.5">
                    <span className={row.status === "Active" ? "text-brand-green" : "text-brand-amber"}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "map":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-3">
          <MapPin className="h-6 w-6" />
          <span className="text-[11px]">Geo distribution map</span>
        </div>
      );
    default:
      return null;
  }
}

function cnDelta(isUp: boolean) {
  return isUp ? "text-[11px] font-medium text-brand-green" : "text-[11px] font-medium text-brand-red";
}
