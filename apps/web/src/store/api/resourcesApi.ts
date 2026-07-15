import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { ApiResource, AuthType, HttpMethod, WidgetSuggestion } from "@/types";

export interface CreateResourceInput {
  name: string;
  url: string;
  method?: HttpMethod;
  authType?: AuthType;
  authCredential?: string;
  importedFrom?: "postman" | "openapi" | "curl" | "manual";
}

export interface ParsedPostmanEndpoint {
  name: string;
  method: HttpMethod;
  url: string;
  authType: AuthType;
  authCredential?: string;
}

export interface BulkResourceInput {
  name: string;
  url: string;
  method?: HttpMethod;
  authType?: AuthType;
  authCredential?: string;
}

export interface UpdateResourceInput {
  name?: string;
  url?: string;
  authType?: AuthType;
  authCredential?: string;
}

export const resourcesApi = createApi({
  reducerPath: "resourcesApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Resource"],
  endpoints: (builder) => ({
    getResources: builder.query<ApiResource[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/resources` }),
      transformResponse: (response: { resources: ApiResource[] }) => response.resources,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((r) => ({ type: "Resource" as const, id: r.id })),
              { type: "Resource" as const, id: `LIST-${projectId}` },
            ]
          : [{ type: "Resource" as const, id: `LIST-${projectId}` }],
    }),
    createResource: builder.mutation<ApiResource, { projectId: string; input: CreateResourceInput }>({
      query: ({ projectId, input }) => ({ url: `/projects/${projectId}/resources`, method: "POST", data: input }),
      transformResponse: (response: { resource: ApiResource }) => response.resource,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Resource", id: `LIST-${projectId}` }],
    }),
    // Preview step for Postman bulk import — parses the collection, writes nothing.
    parsePostmanCollection: builder.mutation<ParsedPostmanEndpoint[], { projectId: string; collection: unknown }>({
      query: ({ projectId, collection }) => ({
        url: `/projects/${projectId}/resources/import/postman/parse`,
        method: "POST",
        data: { collection },
      }),
      transformResponse: (response: { items: ParsedPostmanEndpoint[] }) => response.items,
    }),
    createResourcesBulk: builder.mutation<ApiResource[], { projectId: string; resources: BulkResourceInput[] }>({
      query: ({ projectId, resources }) => ({
        url: `/projects/${projectId}/resources/bulk`,
        method: "POST",
        data: { resources },
      }),
      transformResponse: (response: { resources: ApiResource[] }) => response.resources,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Resource", id: `LIST-${projectId}` }],
    }),
    updateResource: builder.mutation<ApiResource, { projectId: string; id: string; input: UpdateResourceInput }>({
      query: ({ projectId, id, input }) => ({
        url: `/projects/${projectId}/resources/${id}`,
        method: "PATCH",
        data: input,
      }),
      transformResponse: (response: { resource: ApiResource }) => response.resource,
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "Resource", id: `LIST-${projectId}` },
        { type: "Resource", id },
      ],
    }),
    deleteResource: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/resources/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "Resource", id: `LIST-${projectId}` },
        { type: "Resource", id },
      ],
    }),
    testResourceConnection: builder.mutation<ApiResource, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/resources/${id}/test-connection`, method: "POST" }),
      transformResponse: (response: { resource: ApiResource }) => response.resource,
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "Resource", id: `LIST-${projectId}` },
        { type: "Resource", id },
      ],
    }),
    // Live response body for a resource, proxied server-side (credentials never
    // reach the browser). Widgets poll this via `pollingInterval` for refresh.
    getResourceData: builder.query<unknown, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/resources/${id}/data` }),
      transformResponse: (response: { data: unknown }) => response.data,
    }),
    // AI-backed (Groq) widget-type + field-mapping suggestion, with a
    // data-aware heuristic fallback server-side when no AI provider is
    // configured or the call fails — see apps/api/src/lib/aiSuggest.ts.
    suggestWidget: builder.mutation<WidgetSuggestion, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/resources/${id}/suggest-widget`, method: "POST" }),
      transformResponse: (response: { suggestion: WidgetSuggestion }) => response.suggestion,
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useParsePostmanCollectionMutation,
  useCreateResourcesBulkMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTestResourceConnectionMutation,
  useGetResourceDataQuery,
  useSuggestWidgetMutation,
} = resourcesApi;
