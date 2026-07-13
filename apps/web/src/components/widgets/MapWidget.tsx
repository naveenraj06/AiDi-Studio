import { Mercator } from "@visx/geo";
import type { ExtendedFeature } from "@visx/vendor/d3-geo";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import land110m from "world-atlas/land-110m.json";
import type { ShapedRow } from "@/lib/shapeWidgetData";

interface MapWidgetProps {
  rows: ShapedRow[];
  color?: string;
  showLegend?: boolean;
}

interface Point {
  label: string;
  lat: number;
  lon: number;
  value: number;
}

const WIDTH = 400;
const HEIGHT = 220;

const topology = land110m as unknown as Topology<{ land: GeometryCollection }>;
// "land" is a GeometryCollection, so topojson-client always resolves this to a FeatureCollection.
const landData = topojson.feature(topology, topology.objects.land) as FeatureCollection;
const landFeatures = landData.features;

export function MapWidget({ rows, color = "#22d3ee", showLegend = true }: MapWidgetProps) {
  const points: Point[] = rows
    .filter((r) => typeof r.lat === "number" && typeof r.lon === "number")
    .map((r) => ({
      label: String(r.label ?? ""),
      lat: Number(r.lat),
      lon: Number(r.lon),
      value: Number(r.value ?? r["y-axis"] ?? 0),
    }));

  if (points.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-ink-3">No geo data yet</div>;
  }

  const maxValue = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="flex h-full flex-col gap-2">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-h-0 flex-1 rounded-lg" preserveAspectRatio="xMidYMid meet">
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="var(--color-surface-sunken)" rx={8} />
        {/* d3-geo's fitSize accepts any GeoJSON object at runtime (including a
            FeatureCollection); @visx/geo's types only declare a single Feature. */}
        <Mercator data={landFeatures} fitSize={[[WIDTH, HEIGHT], landData as unknown as ExtendedFeature]}>
          {({ features, projection }) => (
            <g>
              {features.map(({ path, feature }, i) => (
                <path
                  key={feature.id ?? i}
                  d={path || undefined}
                  fill="var(--color-border-strong)"
                  stroke="var(--color-border-subtle)"
                  strokeWidth={0.5}
                />
              ))}
              {points.map((p, i) => {
                const coords = projection([p.lon, p.lat]);
                if (!coords) return null;
                const [x, y] = coords;
                const r = 4 + (p.value / maxValue) * 9;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1.5} />
                    <circle cx={x} cy={y} r={2.5} fill={color} />
                    <title>{`${p.label}: ${p.value}`}</title>
                  </g>
                );
              })}
            </g>
          )}
        </Mercator>
      </svg>
      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-3">
          {points.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              {p.label} ({p.value})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
