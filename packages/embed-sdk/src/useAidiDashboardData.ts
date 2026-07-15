import * as React from "react";
import { fetchDashboardData, type AidiSdkDashboardData, type FetchDashboardDataOptions } from "./sdkData";

export interface UseAidiDashboardDataResult {
  data: AidiSdkDashboardData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Headless hook around fetchDashboardData — the "native, no-iframe" embed:
 * you own the rendering, this just gets you the live data.
 */
export function useAidiDashboardData(options: FetchDashboardDataOptions): UseAidiDashboardDataResult {
  const { apiKey, baseUrl, dashboardSlug } = options;
  const [data, setData] = React.useState<AidiSdkDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchDashboardData({ apiKey, baseUrl, dashboardSlug, signal: controller.signal })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        setLoading(false);
      });
    return () => controller.abort();
  }, [apiKey, baseUrl, dashboardSlug]);

  return { data, loading, error };
}
