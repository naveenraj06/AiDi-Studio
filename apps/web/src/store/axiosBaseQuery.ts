import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import { ApiError } from "@/lib/errors";

export interface AxiosBaseQueryArgs {
  url: string;
  method?: Method;
  data?: unknown;
  params?: unknown;
}

export interface AxiosBaseQueryError {
  status: number;
  message: string;
  code?: string;
}

/** Adapts an axios instance into an RTK Query `baseQuery`, so every api slice talks over axios instead of fetch. */
export function axiosBaseQuery(
  client: AxiosInstance,
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async ({ url, method = "GET", data, params }) => {
    try {
      const requestConfig: AxiosRequestConfig = { url, method, data, params };
      const result = await client.request(requestConfig);
      return { data: result.data };
    } catch (err) {
      const error = err as ApiError;
      return { error: { status: error.status, message: error.message, code: error.code } };
    }
  };
}
