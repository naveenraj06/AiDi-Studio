import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface CreatedApiKey extends ApiKey {
  /** The full secret — only ever present in the response to the create call. */
  key: string;
}

export const apiKeysApi = createApi({
  reducerPath: "apiKeysApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["ApiKey"],
  endpoints: (builder) => ({
    getApiKeys: builder.query<ApiKey[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/api-keys` }),
      transformResponse: (response: { apiKeys: ApiKey[] }) => response.apiKeys,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((k) => ({ type: "ApiKey" as const, id: k.id })),
              { type: "ApiKey" as const, id: `LIST-${projectId}` },
            ]
          : [{ type: "ApiKey" as const, id: `LIST-${projectId}` }],
    }),
    createApiKey: builder.mutation<CreatedApiKey, { projectId: string; name: string }>({
      query: ({ projectId, name }) => ({ url: `/projects/${projectId}/api-keys`, method: "POST", data: { name } }),
      transformResponse: (response: { apiKey: CreatedApiKey }) => response.apiKey,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "ApiKey", id: `LIST-${projectId}` }],
    }),
    revokeApiKey: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/api-keys/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "ApiKey", id: `LIST-${projectId}` },
        { type: "ApiKey", id },
      ],
    }),
  }),
});

export const { useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation } = apiKeysApi;
