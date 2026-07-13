import type { FieldMapping, WidgetFineTune, WidgetType } from "@/types";
import { useLiveNews, useLiveWeather, type LiveSource } from "@/lib/liveData";
import { useWidgetRows } from "@/hooks/useWidgetRows";
import type { ShapedRow } from "@/lib/shapeWidgetData";
import { ChartWidget } from "@/components/widgets/ChartWidget";
import { MetricWidget } from "@/components/widgets/MetricWidget";
import { TableWidget } from "@/components/widgets/TableWidget";
import { ListWidget } from "@/components/widgets/ListWidget";
import { CalendarHeatmapWidget } from "@/components/widgets/CalendarHeatmapWidget";
import { MapWidget } from "@/components/widgets/MapWidget";
import { TextWidget } from "@/components/widgets/TextWidget";
import { ImageWidget } from "@/components/widgets/ImageWidget";
import { DividerWidget } from "@/components/widgets/DividerWidget";
import { ButtonWidget } from "@/components/widgets/ButtonWidget";
import { ContainerWidget } from "@/components/widgets/ContainerWidget";
import { TabsWidget } from "@/components/widgets/TabsWidget";
import { ModalWidget } from "@/components/widgets/ModalWidget";

interface WidgetRendererProps {
  type: WidgetType;
  projectId?: string | null;
  resourceId?: string | null;
  mapping?: FieldMapping[] | null;
  ft?: Partial<WidgetFineTune>;
  /** The "Weather & News Sample" demo project's widgets fetch straight from
   * two free public APIs instead of going through the generic resource-data
   * proxy — see lib/liveData.ts and DashboardCanvasPage's `deriveLiveSource`. */
  liveSource?: LiveSource;
}

function demoRowsFor(
  liveSource: LiveSource | undefined,
  weather: ReturnType<typeof useLiveWeather>["data"],
  news: ReturnType<typeof useLiveNews>["data"],
): ShapedRow[] | null {
  if (liveSource === "weather-temp" && weather) {
    return weather.daily.time.map((date, i) => ({
      "x-axis": date.slice(5),
      "y-axis": weather.daily.temperature_2m_max[i],
    }));
  }
  if (liveSource === "weather-wind" && weather) {
    return weather.daily.time.map((date, i) => ({
      "x-axis": date.slice(5),
      "y-axis": weather.daily.wind_speed_10m_max[i],
    }));
  }
  if (liveSource === "weather-current" && weather) {
    return [{ value: weather.current.temperature_2m }];
  }
  if (liveSource === "news-table" && news) {
    return news.map((story) => ({
      title: story.title,
      score: `${story.score} pts`,
      comments: `${story.descendants ?? 0} comments`,
    }));
  }
  return null;
}

/** Dispatches a widget type to its renderer and feeds it normalized rows —
 * live resource data when bound, sample data otherwise. */
export function WidgetRenderer({ type, projectId, resourceId, mapping, ft = {}, liveSource }: WidgetRendererProps) {
  const isWeather = liveSource === "weather-temp" || liveSource === "weather-wind" || liveSource === "weather-current";
  const isNews = liveSource === "news-table";
  const { data: weather } = useLiveWeather(isWeather);
  const { data: news } = useLiveNews(isNews);

  const { rows: fetchedRows } = useWidgetRows({ projectId, resourceId, mapping, type, refreshInterval: ft.refreshInterval });
  const rows = demoRowsFor(liveSource, weather, news) ?? fetchedRows;

  const color = ft.color ?? "#8b5cf6";

  return (
    <div className="relative flex h-full w-full flex-col">
      {liveSource && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          Live
        </div>
      )}
      {renderWidget(type, rows, color, ft, projectId)}
    </div>
  );
}

function renderWidget(
  type: WidgetType,
  rows: ShapedRow[],
  color: string,
  ft: Partial<WidgetFineTune>,
  projectId: string | null | undefined,
) {
  switch (type) {
    case "line":
    case "area":
    case "bar":
    case "stacked-bar":
    case "donut":
    case "scatter":
    case "radar":
    case "treemap":
    case "funnel":
      return (
        <ChartWidget
          chartKind={type}
          rows={rows}
          color={color}
          showLegend={ft.showLegend ?? true}
          showPoints={ft.showPoints ?? true}
          showTooltip={ft.showTooltip ?? true}
          horizontal={ft.horizontal ?? false}
          showGrid={ft.showGrid ?? true}
          showAxisLabels={ft.showAxisLabels ?? true}
          smoothLine={ft.smoothLine ?? true}
          asPie={ft.asPie ?? false}
        />
      );

    case "stat":
    case "gauge":
    case "sparkline":
    case "progress":
      return (
        <MetricWidget
          metricKind={type}
          rows={rows}
          color={color}
          unit={ft.unit}
          min={ft.min}
          max={ft.max}
          thresholdWarn={ft.thresholdWarn}
          thresholdCritical={ft.thresholdCritical}
          trendLabel={ft.trendLabel}
          footer1Label={ft.footer1Label}
          footer2Label={ft.footer2Label}
          compactNumbers={ft.compactNumbers ?? true}
          showValue={ft.showValue ?? true}
        />
      );

    case "table":
      return <TableWidget rows={rows} pageSize={ft.pageSize} stripedRows={ft.stripedRows ?? false} />;

    case "list":
      return <ListWidget rows={rows} color={color} showPercentage={ft.showPercentage ?? true} />;

    case "calendar-heatmap":
      return <CalendarHeatmapWidget rows={rows} color={color} />;

    case "map":
      return <MapWidget rows={rows} color={color} showLegend={ft.showLegend ?? true} />;

    case "text":
      return <TextWidget title={ft.title} body={ft.body} align={ft.align ?? "left"} />;

    case "image":
      return <ImageWidget imageUrl={ft.imageUrl} title={ft.title} fit={ft.fit ?? "cover"} />;

    case "divider":
      return <DividerWidget title={ft.title} dashed={ft.dashed ?? false} />;

    case "button":
      return (
        <ButtonWidget
          buttonLabel={ft.buttonLabel}
          buttonUrl={ft.buttonUrl}
          color={color}
          openInNewTab={ft.openInNewTab ?? true}
        />
      );

    case "container":
      return <ContainerWidget title={ft.title} description={ft.description} color={color} />;

    case "tabs":
      return <TabsWidget views={ft.views ?? []} projectId={projectId} />;

    case "modal":
      return <ModalWidget buttonLabel={ft.buttonLabel} title={ft.title} view={ft.views?.[0]} projectId={projectId} />;

    default:
      return null;
  }
}
