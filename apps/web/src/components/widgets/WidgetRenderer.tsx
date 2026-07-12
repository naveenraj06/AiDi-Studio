import type { WidgetType } from "@/types";
import { useLiveNews, useLiveWeather, type LiveSource } from "@/lib/liveData";

interface WidgetRendererProps {
  type: WidgetType;
  color?: string;
  showLegend?: boolean;
  showPoints?: boolean;
  /** When set, fetches real data from a free public API (Open-Meteo / Hacker News) instead of using demo numbers. */
  liveSource?: LiveSource;
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

function scaleToY(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => 160 - ((v - min) / range) * 140 + 10);
}

/** Mini chart preview used by the widget builder (step 4), the widgets library, and dashboard tiles. */
export function WidgetRenderer({
  type,
  color = "#8b5cf6",
  showLegend = true,
  showPoints = true,
  liveSource,
}: WidgetRendererProps) {
  const isWeather = liveSource === "weather-temp" || liveSource === "weather-wind" || liveSource === "weather-current";
  const isNews = liveSource === "news-table";
  const { data: weather } = useLiveWeather(isWeather);
  const { data: news } = useLiveNews(isNews);

  const liveTempXs =
    liveSource === "weather-temp" && weather
      ? weather.daily.temperature_2m_max.map((_, i) => (i * 400) / (weather.daily.temperature_2m_max.length - 1))
      : null;
  const liveTempYs =
    liveSource === "weather-temp" && weather ? scaleToY(weather.daily.temperature_2m_max) : null;

  const xs = liveTempXs ?? XS;
  const ys = liveTempYs ?? YS;
  const linePoints = xs.map((x, i) => `${x},${ys[i]}`).join(" ");

  const barValues =
    liveSource === "weather-wind" && weather
      ? weather.daily.wind_speed_10m_max.map((v) => Math.min(100, Math.round((v / 50) * 100)))
      : BAR_HEIGHTS;

  const statValue =
    liveSource === "weather-current" && weather ? `${Math.round(weather.current.temperature_2m)}°C` : "18.2k";
  const statSubtitle =
    liveSource === "weather-current" && weather
      ? `Wind ${Math.round(weather.current.wind_speed_10m)} km/h · New York`
      : "▲ 8.2% vs last period";

  const tableRows =
    liveSource === "news-table" && news
      ? news.map((story) => ({
          a: story.title,
          b: `${story.score} pts`,
          c: `${story.descendants ?? 0} comments`,
        }))
      : TABLE_ROWS;

  return (
    <div className="relative flex h-full w-full flex-col">
      {liveSource && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          Live
        </div>
      )}

      {type === "line" && (
        <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
          <polyline points={linePoints} fill="none" stroke={color} strokeWidth={3} />
          {showPoints && xs.map((x, i) => <circle key={x} cx={x} cy={ys[i]} r={4} fill={color} />)}
        </svg>
      )}

      {type === "bar" && (
        <div className="flex flex-1 items-end gap-2.5 px-1 py-2.5">
          {barValues.map((h, i) => (
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
            {statValue}
          </div>
          <div className="text-[12px] text-brand-green">{statSubtitle}</div>
        </div>
      )}

      {type === "table" && (
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden p-1">
          {tableRows.map((row) => (
            <div
              key={row.a}
              className="flex gap-2.5 border-b border-border-subtle pb-1.5 text-[11px] text-ink-2"
            >
              <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{row.a}</div>
              <div className="w-[60px] shrink-0">{row.b}</div>
              <div className="w-[90px] shrink-0" style={{ color }}>
                {row.c}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "donut" && (
        <div className="flex flex-1 items-center justify-center gap-5">
          <svg width="120" height="120" viewBox="0 0 42 42">
            <circle r="15.9" cx="21" cy="21" fill="transparent" stroke="var(--color-border-strong)" strokeWidth={7} />
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
              "repeating-linear-gradient(45deg,var(--color-surface-sunken),var(--color-surface-sunken) 10px,var(--color-bg-2) 10px,var(--color-bg-2) 20px)",
          }}
        >
          map data by region
        </div>
      )}
    </div>
  );
}
