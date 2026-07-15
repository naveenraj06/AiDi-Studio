import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";

export interface Org {
  id: string;
  name: string;
  domain: string;
  owner_id: string;
  created_at: string;
}

export const orgApi = createApi({
  reducerPath: "orgApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Org"],
  endpoints: (builder) => ({
    getMyOrg: builder.query<Org | null, void>({
      query: () => ({ url: "/orgs/mine" }),
      transformResponse: (response: { org: Org | null }) => response.org,
      providesTags: ["Org"],
    }),
    createOrg: builder.mutation<Org, { projectId: string; name: string }>({
      query: ({ projectId, name }) => ({ url: `/projects/${projectId}/org`, method: "POST", data: { name } }),
      transformResponse: (response: { org: Org }) => response.org,
      invalidatesTags: ["Org"],
    }),
  }),
});

export const { useGetMyOrgQuery, useCreateOrgMutation } = orgApi;
