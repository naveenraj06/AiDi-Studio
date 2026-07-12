import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { Billing, Plan } from "@/types";

export interface UpdateBillingInput {
  plan?: Plan;
  seats?: number;
}

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Billing"],
  endpoints: (builder) => ({
    getBilling: builder.query<Billing, string>({
      query: (projectId) => ({ url: `/projects/${projectId}/billing` }),
      transformResponse: (response: { billing: Billing }) => response.billing,
      providesTags: (_result, _error, projectId) => [{ type: "Billing", id: projectId }],
    }),
    updateBilling: builder.mutation<Billing, { projectId: string; input: UpdateBillingInput }>({
      query: ({ projectId, input }) => ({ url: `/projects/${projectId}/billing`, method: "PATCH", data: input }),
      transformResponse: (response: { billing: Billing }) => response.billing,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Billing", id: projectId }],
    }),
  }),
});

export const { useGetBillingQuery, useUpdateBillingMutation } = billingApi;
