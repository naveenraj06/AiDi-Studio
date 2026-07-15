export interface AidiSdkWidgetData {
  id: string;
  name: string | null;
  type: string | null;
  colSpan: number;
  rowSpan: number;
  data: unknown;
}

export interface AidiSdkDashboardData {
  dashboard: { id: string; name: string; slug: string };
  widgets: AidiSdkWidgetData[];
}

export interface FetchDashboardDataOptions {
  /** SDK API key created on the project's Billing/API keys page — Pro or Org plan required. */
  apiKey: string;
  /** Origin of the AiDi Studio deployment, e.g. "https://dashboards.yourcompany.com". */
  baseUrl: string;
  /** The dashboard's slug, from its public share URL. */
  dashboardSlug: string;
  signal?: AbortSignal;
}

/**
 * Fetches a published dashboard's live widget data directly — no iframe. Every
 * resource-bound widget's data is resolved server-side (credentials never
 * leave AiDi Studio's backend) and returned as plain JSON, so you can render
 * it with your own components.
 */
export async function fetchDashboardData({
  apiKey,
  baseUrl,
  dashboardSlug,
  signal,
}: FetchDashboardDataOptions): Promise<AidiSdkDashboardData> {
  const url = new URL(`/sdk/dashboards/${encodeURIComponent(dashboardSlug)}`, baseUrl);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as AidiSdkDashboardData;
}
