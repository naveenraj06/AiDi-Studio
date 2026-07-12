import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { setToast, hideToast, TOAST_DURATION_MS } from "@/store/uiSlice";
import { publicDashboardApi } from "@/store/api/publicDashboardApi";

interface RtkQueryRejectedAction {
  type: string;
  payload?: { status: number; message: string };
  meta?: { arg?: { type?: "query" | "mutation"; endpointName?: string } };
}

/**
 * Surfaces failed RTK Query *queries* (GETs) as a toast, mirroring the old
 * QueryCache.onError behavior. Mutations already toast their own specific,
 * contextual error messages at each call site, so they're excluded here —
 * without that this would double-toast every failed mutation. The public
 * dashboard slice is excluded entirely: 401 (locked) and 404 (not found) are
 * expected states that page renders dedicated UI for, not failures.
 */
export const apiErrorToastMiddleware: Middleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const a = action as unknown as RtkQueryRejectedAction;
    const isQuery = a.meta?.arg?.type === "query";
    const isPublicDashboard = a.type.startsWith(`${publicDashboardApi.reducerPath}/`);
    if (isQuery && !isPublicDashboard) {
      const message = a.payload?.message || "Something went wrong — check your connection and try again";
      store.dispatch(setToast({ msg: message, kind: "error" }));
      const token = (store.getState() as { ui: { toast: { token: number } | null } }).ui.toast?.token;
      setTimeout(() => store.dispatch(hideToast(token)), TOAST_DURATION_MS);
    }
  }
  return next(action);
};
