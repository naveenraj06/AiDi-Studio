import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer, { initAuthListener } from "@/store/authSlice";
import uiReducer from "@/store/uiSlice";
import { apiErrorToastMiddleware } from "@/store/apiErrorToastMiddleware";
import { projectsApi } from "@/store/api/projectsApi";
import { dashboardsApi } from "@/store/api/dashboardsApi";
import { widgetsApi } from "@/store/api/widgetsApi";
import { resourcesApi } from "@/store/api/resourcesApi";
import { teamApi } from "@/store/api/teamApi";
import { billingApi } from "@/store/api/billingApi";
import { publicDashboardApi } from "@/store/api/publicDashboardApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [dashboardsApi.reducerPath]: dashboardsApi.reducer,
    [widgetsApi.reducerPath]: widgetsApi.reducer,
    [resourcesApi.reducerPath]: resourcesApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [publicDashboardApi.reducerPath]: publicDashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      projectsApi.middleware,
      dashboardsApi.middleware,
      widgetsApi.middleware,
      resourcesApi.middleware,
      teamApi.middleware,
      billingApi.middleware,
      publicDashboardApi.middleware,
      apiErrorToastMiddleware,
    ),
});

// Enables RTK Query's refetchOnFocus / refetchOnReconnect behavior.
setupListeners(store.dispatch);

initAuthListener(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
