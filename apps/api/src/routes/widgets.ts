import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { prisma } from "../lib/prisma.js";
import { serializeWidget } from "../lib/serialize.js";

const WIDGET_INCLUDE = { resource: true } as const;

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

export default async function widgetRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/widgets", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const widgets = await prisma.widget.findMany({
      where: { projectId },
      include: WIDGET_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return reply.send({ widgets: widgets.map(serializeWidget) });
  });

  app.post("/projects/:projectId/widgets", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    if (parsed.data.resourceId) {
      const resource = await prisma.apiResource.findFirst({
        where: { id: parsed.data.resourceId, projectId },
      });
      if (!resource) return reply.code(400).send({ error: "Resource not found in this project" });
    }

    const { isTemplate, resourceId, mapping, fineTune, ...rest } = parsed.data;
    const widget = await prisma.widget.create({
      data: { ...rest, projectId, isTemplate, resourceId, mapping, fineTune },
      include: WIDGET_INCLUDE,
    });
    return reply.code(201).send({ widget: serializeWidget(widget) });
  });

  app.patch("/projects/:projectId/widgets/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const existing = await prisma.widget.findFirst({ where: { id, projectId } });
    if (!existing) return reply.code(404).send({ error: "Widget not found" });

    const { isTemplate, resourceId, mapping, fineTune, ...rest } = parsed.data;
    const widget = await prisma.widget.update({
      where: { id },
      data: { ...rest, isTemplate, resourceId, mapping, fineTune },
      include: WIDGET_INCLUDE,
    });
    return reply.send({ widget: serializeWidget(widget) });
  });

  app.delete("/projects/:projectId/widgets/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const result = await prisma.widget.deleteMany({ where: { id, projectId } });
    if (result.count === 0) return reply.code(404).send({ error: "Widget not found" });
    return reply.code(204).send();
  });
}
