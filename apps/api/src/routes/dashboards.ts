import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../lib/authz.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { serializeDashboard, type DashboardRow } from "../lib/serialize.js";
import { randomSuffix, slugify } from "../lib/slug.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

const DASHBOARD_SELECT = "*, dashboard_tiles(widget_id, position, col_span, row_span)";
// Anonymous public viewers can't call the authenticated /widgets endpoint to
// resolve tile names/types, so the public route embeds them directly.
const PUBLIC_DASHBOARD_SELECT =
  "*, dashboard_tiles(widget_id, position, col_span, row_span, widget:widgets(name, type, resource:api_resources(name)))";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a dashboard name"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  status: z.enum(["draft", "published"]).optional(),
  sharePassword: z.string().min(4).nullable().optional(),
});

const tilesSchema = z.object({
  tiles: z.array(
    z.object({
      widgetId: z.string().min(1),
      colSpan: z.number().int().min(1).max(12),
      rowSpan: z.number().int().min(1).max(12),
    }),
  ),
});

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("dashboards").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${randomSuffix()}`;
  }
  return `${slugify(base)}-${randomSuffix()}`;
}

export default async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get(
    "/projects/:projectId/dashboards",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const { data, error } = await supabase
        .from("dashboards")
        .select(DASHBOARD_SELECT)
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false })
        .returns<DashboardRow[]>();
      if (error) return reply.code(500).send({ error: "Failed to load dashboards" });
      return reply.send({ dashboards: (data ?? []).map(serializeDashboard) });
    },
  );

  app.post(
    "/projects/:projectId/dashboards",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(createSchema, request, reply);
      if (!data) return;

      const slug = await uniqueSlug(data.name);
      const { data: dashboard, error } = await supabase
        .from("dashboards")
        .insert({ name: data.name, slug, project_id: projectId })
        .select(DASHBOARD_SELECT)
        .single<DashboardRow>();
      if (error || !dashboard) return reply.code(500).send({ error: "Failed to create dashboard" });
      return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
    },
  );

  app.get(
    "/projects/:projectId/dashboards/:id",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const { data: dashboard, error } = await supabase
        .from("dashboards")
        .select(DASHBOARD_SELECT)
        .eq("id", id)
        .eq("project_id", projectId)
        .maybeSingle<DashboardRow>();
      if (error || !dashboard) return reply.code(404).send({ error: "Dashboard not found" });
      return reply.send({ dashboard: serializeDashboard(dashboard) });
    },
  );

  app.patch(
    "/projects/:projectId/dashboards/:id",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const data = parseBody(updateSchema, request, reply);
      if (!data) return;

      const { sharePassword, ...rest } = data;
      const patch: Record<string, unknown> = { ...rest, updated_at: new Date().toISOString() };
      if (sharePassword !== undefined) {
        patch.share_password_hash = sharePassword ? await hashPassword(sharePassword) : null;
      }

      const { data: dashboard, error } = await supabase
        .from("dashboards")
        .update(patch)
        .eq("id", id)
        .eq("project_id", projectId)
        .select(DASHBOARD_SELECT)
        .maybeSingle<DashboardRow>();
      if (error) return reply.code(500).send({ error: "Failed to update dashboard" });
      if (!dashboard) return reply.code(404).send({ error: "Dashboard not found" });
      return reply.send({ dashboard: serializeDashboard(dashboard) });
    },
  );

  app.put(
    "/projects/:projectId/dashboards/:id/tiles",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const data = parseBody(tilesSchema, request, reply);
      if (!data) return;

      const { data: dashboard } = await supabase
        .from("dashboards")
        .select("id")
        .eq("id", id)
        .eq("project_id", projectId)
        .maybeSingle();
      if (!dashboard) return reply.code(404).send({ error: "Dashboard not found" });

      const widgetIds = data.tiles.map((t) => t.widgetId);
      if (widgetIds.length) {
        const { count } = await supabase
          .from("widgets")
          .select("id", { count: "exact", head: true })
          .eq("project_id", projectId)
          .in("id", widgetIds);
        if ((count ?? 0) !== new Set(widgetIds).size) {
          return reply.code(400).send({ error: "One or more widgets do not belong to this project" });
        }
      }

      const { error: rpcError } = await supabase.rpc("replace_dashboard_tiles", {
        p_dashboard_id: id,
        p_tiles: data.tiles,
      });
      if (rpcError) return reply.code(500).send({ error: "Failed to update dashboard layout" });

      const { data: updated, error } = await supabase
        .from("dashboards")
        .select(DASHBOARD_SELECT)
        .eq("id", id)
        .single<DashboardRow>();
      if (error || !updated) return reply.code(500).send({ error: "Failed to load updated dashboard" });
      return reply.send({ dashboard: serializeDashboard(updated) });
    },
  );

  app.delete(
    "/projects/:projectId/dashboards/:id",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const { data, error } = await supabase
        .from("dashboards")
        .delete()
        .eq("id", id)
        .eq("project_id", projectId)
        .select("id");
      if (error) return reply.code(500).send({ error: "Failed to delete dashboard" });
      if (!data || data.length === 0) return reply.code(404).send({ error: "Dashboard not found" });
      return reply.code(204).send();
    },
  );
}

const publicPasswordSchema = z.object({ password: z.string().optional() });

export async function publicDashboardRoutes(app: FastifyInstance) {
  app.get(
    "/public/dashboards/:slug",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const parsed = publicPasswordSchema.safeParse(request.query);
      const password = parsed.success ? parsed.data.password : undefined;

      const { data: dashboard, error } = await supabase
        .from("dashboards")
        .select(PUBLIC_DASHBOARD_SELECT)
        .eq("slug", slug)
        .maybeSingle<DashboardRow>();
      if (error || !dashboard || dashboard.status !== "published") {
        return reply.code(404).send({ error: "Dashboard not found" });
      }

      if (dashboard.share_password_hash) {
        if (!password || !(await verifyPassword(password, dashboard.share_password_hash))) {
          return reply.code(401).send({ error: "Password required", locked: true });
        }
      }

      return reply.send({ dashboard: serializeDashboard(dashboard) });
    },
  );
}
