import { useQuery } from "@tanstack/react-query";
import { publicApiFetch } from "@/lib/api";
import type { Dashboard } from "@/types";

// The public endpoint returns 401 only when a share password is required
// and missing/wrong, and 404 when the slug doesn't exist or isn't published.
export function usePublicDashboard(slug: string | undefined, password?: string) {
  return useQuery({
    queryKey: ["public-dashboard", slug, password],
    queryFn: () => {
      const qs = password ? `?password=${encodeURIComponent(password)}` : "";
      return publicApiFetch<{ dashboard: Dashboard }>(`/public/dashboards/${slug}${qs}`).then(
        (r) => r.dashboard,
      );
    },
    enabled: !!slug,
    retry: false,
  });
}
