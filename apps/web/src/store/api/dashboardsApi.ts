import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { Dashboard } from "@/types";

export interface UpdateDashboardInput {
  name?: string;
  status?: "draft" | "published";
  sharePassword?: string | null;
}

export interface TileInput {
  widgetId: string;
  colSpan: number;
  rowSpan: number;
}

export const dashboardsApi = createApi({
  reducerPath: "dashboardsApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboards: builder.query<Dashboard[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/dashboards` }),
      transformResponse: (response: { dashboards: Dashboard[] }) => response.dashboards,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((d) => ({ type: "Dashboard" as const, id: d.id })),
              { type: "Dashboard" as const, id: `LIST-${projectId}` },
            ]
          : [{ type: "Dashboard" as const, id: `LIST-${projectId}` }],
    }),
    getDashboard: builder.query<Dashboard, { projectId: string; dashboardId: string }>({
      query: ({ projectId, dashboardId }) => ({ url: `/projects/${projectId}/dashboards/${dashboardId}` }),
      transformResponse: (response: { dashboard: Dashboard }) => response.dashboard,
      providesTags: (_result, _error, { dashboardId }) => [{ type: "Dashboard", id: dashboardId }],
    }),
    createDashboard: builder.mutation<Dashboard, { projectId: string; name: string }>({
      query: ({ projectId, name }) => ({ url: `/projects/${projectId}/dashboards`, method: "POST", data: { name } }),
      transformResponse: (response: { dashboard: Dashboard }) => response.dashboard,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Dashboard", id: `LIST-${projectId}` }],
    }),
    updateDashboard: builder.mutation<Dashboard, { projectId: string; dashboardId: string; input: UpdateDashboardInput }>({
      query: ({ projectId, dashboardId, input }) => ({
        url: `/projects/${projectId}/dashboards/${dashboardId}`,
        method: "PATCH",
        data: input,
      }),
      transformResponse: (response: { dashboard: Dashboard }) => response.dashboard,
      invalidatesTags: (_result, _error, { projectId, dashboardId }) => [
        { type: "Dashboard", id: `LIST-${projectId}` },
        { type: "Dashboard", id: dashboardId },
      ],
    }),
    replaceDashboardTiles: builder.mutation<Dashboard, { projectId: string; dashboardId: string; tiles: TileInput[] }>({
      query: ({ projectId, dashboardId, tiles }) => ({
        url: `/projects/${projectId}/dashboards/${dashboardId}/tiles`,
        method: "PUT",
        data: { tiles },
      }),
      transformResponse: (response: { dashboard: Dashboard }) => response.dashboard,
      invalidatesTags: (_result, _error, { projectId, dashboardId }) => [
        { type: "Dashboard", id: `LIST-${projectId}` },
        { type: "Dashboard", id: dashboardId },
      ],
    }),
    deleteDashboard: builder.mutation<void, { projectId: string; dashboardId: string }>({
      query: ({ projectId, dashboardId }) => ({
        url: `/projects/${projectId}/dashboards/${dashboardId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId, dashboardId }) => [
        { type: "Dashboard", id: `LIST-${projectId}` },
        { type: "Dashboard", id: dashboardId },
      ],
    }),
  }),
});

export const {
  useGetDashboardsQuery,
  useGetDashboardQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useReplaceDashboardTilesMutation,
  useDeleteDashboardMutation,
} = dashboardsApi;
