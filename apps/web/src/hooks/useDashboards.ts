import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { Dashboard } from "@/types";

export function useDashboards(projectId: string | undefined) {
  return useQuery({
    queryKey: ["dashboards", projectId],
    queryFn: () =>
      apiGet<{ dashboards: Dashboard[] }>(`/projects/${projectId}/dashboards`).then((r) => r.dashboards),
    enabled: !!projectId,
  });
}

export function useDashboard(projectId: string | undefined, dashboardId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", projectId, dashboardId],
    queryFn: () =>
      apiGet<{ dashboard: Dashboard }>(`/projects/${projectId}/dashboards/${dashboardId}`).then(
        (r) => r.dashboard,
      ),
    enabled: !!projectId && !!dashboardId,
  });
}

export function useCreateDashboard(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiPost<{ dashboard: Dashboard }>(`/projects/${projectId}/dashboards`, { name }).then(
        (r) => r.dashboard,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboards", projectId] }),
  });
}

export interface UpdateDashboardInput {
  name?: string;
  status?: "draft" | "published";
  sharePassword?: string | null;
}

export function useUpdateDashboard(projectId: string, dashboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDashboardInput) =>
      apiPatch<{ dashboard: Dashboard }>(`/projects/${projectId}/dashboards/${dashboardId}`, input).then(
        (r) => r.dashboard,
      ),
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: ["dashboards", projectId] });
      queryClient.setQueryData(["dashboard", projectId, dashboardId], dashboard);
    },
  });
}

export interface TileInput {
  widgetId: string;
  colSpan: number;
  rowSpan: number;
}

export function useReplaceDashboardTiles(projectId: string, dashboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tiles: TileInput[]) =>
      apiPut<{ dashboard: Dashboard }>(`/projects/${projectId}/dashboards/${dashboardId}/tiles`, {
        tiles,
      }).then((r) => r.dashboard),
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: ["dashboards", projectId] });
      queryClient.setQueryData(["dashboard", projectId, dashboardId], dashboard);
    },
  });
}

export function useDeleteDashboard(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dashboardId: string) => apiDelete(`/projects/${projectId}/dashboards/${dashboardId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboards", projectId] }),
  });
}
