import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { FieldMapping, Widget, WidgetFineTune, WidgetType } from "@/types";

export interface WidgetInput {
  name?: string;
  type?: WidgetType;
  isTemplate?: boolean;
  resourceId?: string | null;
  mapping?: FieldMapping[];
  fineTune?: Partial<WidgetFineTune>;
}

export const widgetsApi = createApi({
  reducerPath: "widgetsApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Widget"],
  endpoints: (builder) => ({
    getWidgets: builder.query<Widget[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/widgets` }),
      transformResponse: (response: { widgets: Widget[] }) => response.widgets,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((w) => ({ type: "Widget" as const, id: w.id })),
              { type: "Widget" as const, id: `LIST-${projectId}` },
            ]
          : [{ type: "Widget" as const, id: `LIST-${projectId}` }],
    }),
    createWidget: builder.mutation<Widget, { projectId: string; input: WidgetInput }>({
      query: ({ projectId, input }) => ({ url: `/projects/${projectId}/widgets`, method: "POST", data: input }),
      transformResponse: (response: { widget: Widget }) => response.widget,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Widget", id: `LIST-${projectId}` }],
    }),
    updateWidget: builder.mutation<Widget, { projectId: string; id: string; input: WidgetInput }>({
      query: ({ projectId, id, input }) => ({
        url: `/projects/${projectId}/widgets/${id}`,
        method: "PATCH",
        data: input,
      }),
      transformResponse: (response: { widget: Widget }) => response.widget,
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "Widget", id: `LIST-${projectId}` },
        { type: "Widget", id },
      ],
    }),
    deleteWidget: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/widgets/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "Widget", id: `LIST-${projectId}` },
        { type: "Widget", id },
      ],
    }),
  }),
});

export const { useGetWidgetsQuery, useCreateWidgetMutation, useUpdateWidgetMutation, useDeleteWidgetMutation } =
  widgetsApi;
