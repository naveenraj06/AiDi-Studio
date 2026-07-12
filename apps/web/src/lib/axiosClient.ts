import axios, { type AxiosError } from "axios";
import { supabase } from "./supabaseClient";
import { ApiError } from "./errors";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

function toApiError(error: AxiosError<{ error?: string; code?: string }>): ApiError {
  if (error.response) {
    const body = error.response.data;
    return new ApiError(error.response.status, body?.error ?? `Request failed (${error.response.status})`, body?.code);
  }
  return new ApiError(0, "Network error — check your connection and try again");
}

/** Authenticated client — attaches the current Supabase session's bearer token to every request. */
export const axiosClient = axios.create({ baseURL: API_URL });

axiosClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; code?: string }>) => Promise.reject(toApiError(error)),
);

/** Unauthenticated client — for public endpoints (e.g. published dashboards). No session lookup, no auth header. */
export const publicAxiosClient = axios.create({ baseURL: API_URL });

publicAxiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; code?: string }>) => Promise.reject(toApiError(error)),
);
