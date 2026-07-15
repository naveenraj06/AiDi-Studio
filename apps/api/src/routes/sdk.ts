import type { FastifyInstance } from "fastify";
import { fetchResourceJson } from "../lib/resourceFetch.js";
import { supabase } from "../lib/supabase.js";

// @fastify/cors reads `routeOptions.config.cors === false` to let a route opt
// out of the app-wide CORS policy, but doesn't ship a type for it.
declare module "fastify" {
  interface FastifyContextConfig {
    cors?: boolean;
  }
}

const SDK_DASHBOARD_SELECT =
  "*, dashboard_tiles(widget_id, position, col_span, row_span, widget:widgets(name, type, resource:api_resources(url, auth_type, auth_credential)))";

interface SdkTileRow {
  widget_id: string;
  position: number;
  col_span: number;
  row_span: number;
  widget: {
    name: string;
    type: string;
    resource: { url: string; auth_type: string; auth_credential: string | null } | null;
  } | null;
}

interface SdkDashboardRow {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  status: string;
  dashboard_tiles?: SdkTileRow[];
}

/**
 * Third-party origins call this route directly from the browser using an SDK
 * API key (plugins/apiKeyAuth.ts), so every route here opts out of the
 * app-wide @fastify/cors plugin (pinned to one static origin for the
 * first-party web app, see app.ts) via `config: { cors: false }` — the
 * documented per-route escape hatch @fastify/cors provides — and sets an open
 * origin itself instead. That's safe here specifically because the route is
 * protected by a bearer API key, not a cookie, so no ambient credential can
 * be replayed cross-site the way a cookie-authenticated route's could.
 */
export default async function sdkRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (_request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  });

  app.options("/sdk/dashboards/:slug", { config: { cors: false } }, async (_request, reply) => {
    reply.code(204).send();
  });

  app.get(
    "/sdk/dashboards/:slug",
    {
      config: { cors: false, rateLimit: { max: 60, timeWindow: "1 minute" } },
      preHandler: [app.authenticateApiKey],
    },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };

      const { data: dashboard, error } = await supabase
        .from("dashboards")
        .select(SDK_DASHBOARD_SELECT)
        .eq("slug", slug)
        .maybeSingle<SdkDashboardRow>();
      if (error || !dashboard || dashboard.status !== "published" || dashboard.project_id !== request.projectId) {
        return reply.code(404).send({ error: "Dashboard not found" });
      }

      const tiles = [...(dashboard.dashboard_tiles ?? [])].sort((a, b) => a.position - b.position);
      const widgets = await Promise.all(
        tiles.map(async (t) => {
          const resource = t.widget?.resource;
          let data: unknown = null;
          if (resource) {
            try {
              data = await fetchResourceJson(resource);
            } catch {
              data = null;
            }
          }
          return {
            id: t.widget_id,
            name: t.widget?.name ?? null,
            type: t.widget?.type ?? null,
            colSpan: t.col_span,
            rowSpan: t.row_span,
            data,
          };
        }),
      );

      return reply.send({
        dashboard: { id: dashboard.id, name: dashboard.name, slug: dashboard.slug },
        widgets,
      });
    },
  );
}
