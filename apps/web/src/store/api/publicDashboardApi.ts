import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { publicAxiosClient } from "@/lib/axiosClient";
import type { Dashboard } from "@/types";

// Unauthenticated endpoint (published dashboards). Locked (401) and
// not-found (404) are expected states the page renders dedicated UI for, so
// this slice is excluded from the global error-toast middleware — see
// apiErrorToastMiddleware.ts.
export const publicDashboardApi = createApi({
  reducerPath: "publicDashboardApi",
  baseQuery: axiosBaseQuery(publicAxiosClient),
  endpoints: (builder) => ({
    getPublicDashboard: builder.query<Dashboard, { slug: string; password?: string }>({
      query: ({ slug, password }) => ({
        url: `/public/dashboards/${slug}`,
        params: password ? { password } : undefined,
      }),
      transformResponse: (response: { dashboard: Dashboard }) => response.dashboard,
    }),
  }),
});

export const { useGetPublicDashboardQuery } = publicDashboardApi;
