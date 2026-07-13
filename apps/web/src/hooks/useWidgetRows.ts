import { useGetResourceDataQuery } from "@/store/api/resourcesApi";
import { shapeWidgetRows, type ShapedRow } from "@/lib/shapeWidgetData";
import { sampleRowsFor } from "@/components/widgets/sampleData";
import { requiresResource } from "@/components/widgets/widgetTypeMeta";
import type { FieldMapping, WidgetType } from "@/types";

interface UseWidgetRowsArgs {
  projectId?: string | null;
  resourceId?: string | null;
  mapping?: FieldMapping[] | null;
  type: WidgetType;
  refreshInterval?: number;
}

interface UseWidgetRowsResult {
  rows: ShapedRow[];
  isLive: boolean;
  isLoading: boolean;
}

/**
 * The single data path every resource-bound widget renderer goes through:
 * live resource data (proxied + polled) when a resource is attached, sample
 * rows otherwise (builder preview, unbound templates, layout primitives).
 */
export function useWidgetRows({
  projectId,
  resourceId,
  mapping,
  type,
  refreshInterval,
}: UseWidgetRowsArgs): UseWidgetRowsResult {
  const enabled = requiresResource(type) && !!projectId && !!resourceId;
  const { data, isLoading, isSuccess } = useGetResourceDataQuery(
    { projectId: projectId ?? "", id: resourceId ?? "" },
    { skip: !enabled, pollingInterval: refreshInterval ? refreshInterval * 1000 : undefined },
  );

  const isLive = enabled && isSuccess;
  const rows = isLive ? shapeWidgetRows(data, mapping) : sampleRowsFor(type);
  return { rows, isLive, isLoading: enabled && isLoading };
}
