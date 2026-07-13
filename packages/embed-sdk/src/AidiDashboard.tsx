import * as React from "react";

export interface AidiDashboardProps {
  /** The dashboard's slug, taken from its public share URL
   * (e.g. "revenue-overview" in https://your-deployment.example.com/d/revenue-overview). */
  dashboardId: string;
  /** Origin of the AiDi Studio deployment hosting this dashboard,
   * e.g. "https://dashboards.yourcompany.com". */
  baseUrl: string;
  /** Share password, if the dashboard is password-protected. */
  password?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * Embeds a published AiDi Studio dashboard. Renders an iframe against the dashboard's
 * public embed route — the same route the product's own "Copy iframe snippet" button
 * generates — so all data calls stay proxied server-side and no API credentials ever
 * reach the embedding page.
 */
export function AidiDashboard({
  dashboardId,
  baseUrl,
  password,
  width = "100%",
  height = 600,
  className,
  style,
  title = "AiDi Studio dashboard",
}: AidiDashboardProps) {
  const src = React.useMemo(() => {
    const url = new URL(`/d/${encodeURIComponent(dashboardId)}/embed`, baseUrl);
    if (password) url.searchParams.set("password", password);
    return url.toString();
  }, [dashboardId, baseUrl, password]);

  return (
    <iframe
      src={src}
      title={title}
      width={width}
      height={height}
      style={{ border: 0, ...style }}
      className={className}
      loading="lazy"
    />
  );
}
