import type { WidgetType } from "@/types";

interface WidgetRendererProps {
  type: WidgetType;
  color?: string;
  showLegend?: boolean;
  showPoints?: boolean;
}

const YS = [140, 110, 120, 70, 90, 30];
const XS = [0, 80, 160, 240, 320, 400];
const BAR_HEIGHTS = [60, 85, 45, 95, 70, 55];
const TABLE_ROWS = [
  { a: "US-West", b: "1,204", c: "$18.2k" },
  { a: "EU-Central", b: "882", c: "$12.9k" },
  { a: "APAC", b: "604", c: "$8.1k" },
  { a: "US-East", b: "441", c: "$6.4k" },
];

/** Mini chart preview used by the widget builder (step 4) and the widgets library. */
export function WidgetRenderer({
  type,
  color = "#8b5cf6",
  showLegend = true,
  showPoints = true,
}: WidgetRendererProps) {
  const linePoints = XS.map((x, i) => `${x},${YS[i]}`).join(" ");

  return (
    <div className="flex h-full w-full flex-col">
      {type === "line" && (
        <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
          <polyline points={linePoints} fill="none" stroke={color} strokeWidth={3} />
          {showPoints &&
            XS.map((x, i) => <circle key={x} cx={x} cy={YS[i]} r={4} fill={color} />)}
        </svg>
      )}

      {type === "bar" && (
        <div className="flex flex-1 items-end gap-2.5 px-1 py-2.5">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${h}%`, background: color }}
            />
          ))}
        </div>
      )}

      {type === "stat" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="font-display text-[44px] font-extrabold" style={{ color }}>
            18.2k
          </div>
          <div className="text-[12px] text-brand-green">▲ 8.2% vs last period</div>
        </div>
      )}

      {type === "table" && (
        <div className="flex flex-1 flex-col gap-1.5 p-1">
          {TABLE_ROWS.map((row) => (
            <div
              key={row.a}
              className="flex gap-2.5 border-b border-border-subtle pb-1.5 text-[11px] text-ink-2"
            >
              <div className="flex-1">{row.a}</div>
              <div className="flex-1">{row.b}</div>
              <div className="flex-1" style={{ color }}>
                {row.c}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "donut" && (
        <div className="flex flex-1 items-center justify-center gap-5">
          <svg width="120" height="120" viewBox="0 0 42 42">
            <circle r="15.9" cx="21" cy="21" fill="transparent" stroke="#232330" strokeWidth={7} />
            <circle
              r="15.9"
              cx="21"
              cy="21"
              fill="transparent"
              stroke={color}
              strokeWidth={7}
              strokeDasharray="45 100"
              strokeDashoffset={25}
            />
            <circle
              r="15.9"
              cx="21"
              cy="21"
              fill="transparent"
              stroke="#22d3ee"
              strokeWidth={7}
              strokeDasharray="30 100"
              strokeDashoffset={-20}
            />
            <circle
              r="15.9"
              cx="21"
              cy="21"
              fill="transparent"
              stroke="#fbbf24"
              strokeWidth={7}
              strokeDasharray="25 100"
              strokeDashoffset={-50}
            />
          </svg>
          {showLegend && (
            <div className="flex flex-col gap-1.5 text-[11px] text-ink-2">
              <div>
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-sm"
                  style={{ background: color }}
                />
                Segment A
              </div>
              <div>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-brand-cyan" />
                Segment B
              </div>
              <div>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-brand-amber" />
                Segment C
              </div>
            </div>
          )}
        </div>
      )}

      {type === "map" && (
        <div
          className="flex flex-1 items-center justify-center rounded-lg font-mono text-[11px] text-ink-3"
          style={{
            background:
              "repeating-linear-gradient(45deg,#0d0d11,#0d0d11 10px,#131318 10px,#131318 20px)",
          }}
        >
          map data by region
        </div>
      )}
    </div>
  );
}
