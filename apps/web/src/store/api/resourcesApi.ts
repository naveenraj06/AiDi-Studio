import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { ApiResource, AuthType } from "@/types";

export interface CreateResourceInput {
  name: string;
  url: string;
  authType?: AuthType;
  authCredential?: string;
  importedFrom?: "postman" | "openapi" | "curl" | "manual";
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
  }),
});

export const {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTestResourceConnectionMutation,
} = resourcesApi;
