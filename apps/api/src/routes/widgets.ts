import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../lib/authz.js";
import { serializeWidget, type WidgetRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

const WIDGET_SELECT = "*, resource:api_resources(id, name)";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a widget name"),
  type: z.enum(["line", "bar", "stat", "table", "donut", "map"]),
  isTemplate: z.boolean().default(false),
  resourceId: z.string().trim().min(1).nullable().optional(),
  mapping: z.array(z.object({ field: z.string(), role: z.string() })).optional(),
  fineTune: z
    .object({
      title: z.string(),
      color: z.string(),
      showLegend: z.boolean(),
      showPoints: z.boolean(),
      refreshInterval: z.number(),
    })
    .partial()
    .optional(),
});

const updateSchema = createSchema.partial();

function toRow(input: Partial<z.infer<typeof createSchema>>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.type !== undefined) row.type = input.type;
  if (input.isTemplate !== undefined) row.is_template = input.isTemplate;
  if (input.resourceId !== undefined) row.resource_id = input.resourceId;
  if (input.mapping !== undefined) row.mapping = input.mapping;
  if (input.fineTune !== undefined) row.fine_tune = input.fineTune;
  return row;
}

export default async function widgetRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get(
    "/projects/:projectId/widgets",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const { data, error } = await supabase
        .from("widgets")
        .select(WIDGET_SELECT)
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false })
        .returns<WidgetRow[]>();
      if (error) return reply.code(500).send({ error: "Failed to load widgets" });
      return reply.send({ widgets: (data ?? []).map(serializeWidget) });
    },
  );

  app.post(
    "/projects/:projectId/widgets",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(createSchema, request, reply);
      if (!data) return;

      if (data.resourceId) {
        const { data: resource } = await supabase
          .from("api_resources")
          .select("id")
          .eq("id", data.resourceId)
          .eq("project_id", projectId)
          .maybeSingle();
        if (!resource) return reply.code(400).send({ error: "Resource not found in this project" });
      }

      const { data: widget, error } = await supabase
        .from("widgets")
        .insert({ ...toRow(data), project_id: projectId })
        .select(WIDGET_SELECT)
        .single<WidgetRow>();
      if (error || !widget) return reply.code(500).send({ error: "Failed to create widget" });
      return reply.code(201).send({ widget: serializeWidget(widget) });
    },
  );

  app.patch(
    "/projects/:projectId/widgets/:id",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const data = parseBody(updateSchema, request, reply);
      if (!data) return;

      const { data: widget, error } = await supabase
        .from("widgets")
        .update({ ...toRow(data), updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("project_id", projectId)
        .select(WIDGET_SELECT)
        .maybeSingle<WidgetRow>();
      if (error) return reply.code(500).send({ error: "Failed to update widget" });
      if (!widget) return reply.code(404).send({ error: "Widget not found" });
      return reply.send({ widget: serializeWidget(widget) });
    },
  );

  app.delete(
    "/projects/:projectId/widgets/:id",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const { data, error } = await supabase
        .from("widgets")
        .delete()
        .eq("id", id)
        .eq("project_id", projectId)
        .select("id");
      if (error) return reply.code(500).send({ error: "Failed to delete widget" });
      if (!data || data.length === 0) return reply.code(404).send({ error: "Widget not found" });
      return reply.code(204).send();
    },
  );
}
