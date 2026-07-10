import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { FieldMapping, Widget, WidgetFineTune, WidgetType } from "@/types";

export function useWidgets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["widgets", projectId],
    queryFn: () => apiGet<{ widgets: Widget[] }>(`/projects/${projectId}/widgets`).then((r) => r.widgets),
    enabled: !!projectId,
  });
}

export interface WidgetInput {
  name?: string;
  type?: WidgetType;
  isTemplate?: boolean;
  resourceId?: string | null;
  mapping?: FieldMapping[];
  fineTune?: Partial<WidgetFineTune>;
}

export function useCreateWidget(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WidgetInput) =>
      apiPost<{ widget: Widget }>(`/projects/${projectId}/widgets`, input).then((r) => r.widget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["widgets", projectId] }),
  });
}

export function useUpdateWidget(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WidgetInput }) =>
      apiPatch<{ widget: Widget }>(`/projects/${projectId}/widgets/${id}`, input).then((r) => r.widget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["widgets", projectId] }),
  });
}

export function useDeleteWidget(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/projects/${projectId}/widgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["widgets", projectId] }),
  });
}
