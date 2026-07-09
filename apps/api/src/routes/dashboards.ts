import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { serializeDashboard } from "../lib/serialize.js";
import { randomSuffix, slugify } from "../lib/slug.js";

const DASHBOARD_INCLUDE = { tiles: { include: { widget: { include: { resource: true } } } } } as const;

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
  while (await prisma.dashboard.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${randomSuffix()}`;
  }
  return slug;
}

export default async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/dashboards", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const dashboards = await prisma.dashboard.findMany({
      where: { projectId },
      include: DASHBOARD_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return reply.send({ dashboards: dashboards.map(serializeDashboard) });
  });

  app.post("/projects/:projectId/dashboards", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const slug = await uniqueSlug(parsed.data.name);
    const dashboard = await prisma.dashboard.create({
      data: { name: parsed.data.name, slug, projectId },
      include: DASHBOARD_INCLUDE,
    });
    return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
  });

  app.get("/projects/:projectId/dashboards/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const dashboard = await prisma.dashboard.findFirst({ where: { id, projectId }, include: DASHBOARD_INCLUDE });
    if (!dashboard) return reply.code(404).send({ error: "Dashboard not found" });
    return reply.send({ dashboard: serializeDashboard(dashboard) });
  });

  app.patch("/projects/:projectId/dashboards/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const existing = await prisma.dashboard.findFirst({ where: { id, projectId } });
    if (!existing) return reply.code(404).send({ error: "Dashboard not found" });

    const { sharePassword, ...rest } = parsed.data;
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        ...rest,
        ...(sharePassword !== undefined
          ? { sharePasswordHash: sharePassword ? await hashPassword(sharePassword) : null }
          : {}),
      },
      include: DASHBOARD_INCLUDE,
    });
    return reply.send({ dashboard: serializeDashboard(dashboard) });
  });

  app.put("/projects/:projectId/dashboards/:id/tiles", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = tilesSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const dashboard = await prisma.dashboard.findFirst({ where: { id, projectId } });
    if (!dashboard) return reply.code(404).send({ error: "Dashboard not found" });

    const widgetIds = parsed.data.tiles.map((t) => t.widgetId);
    const validWidgets = await prisma.widget.count({ where: { id: { in: widgetIds }, projectId } });
    if (validWidgets !== new Set(widgetIds).size) {
      return reply.code(400).send({ error: "One or more widgets do not belong to this project" });
    }

    await prisma.$transaction([
      prisma.dashboardTile.deleteMany({ where: { dashboardId: id } }),
      prisma.dashboardTile.createMany({
        data: parsed.data.tiles.map((tile, index) => ({
          dashboardId: id,
          widgetId: tile.widgetId,
          colSpan: tile.colSpan,
          rowSpan: tile.rowSpan,
          position: index,
        })),
      }),
      prisma.dashboard.update({ where: { id }, data: { updatedAt: new Date() } }),
    ]);

    const updated = await prisma.dashboard.findUniqueOrThrow({ where: { id }, include: DASHBOARD_INCLUDE });
    return reply.send({ dashboard: serializeDashboard(updated) });
  });

  app.delete("/projects/:projectId/dashboards/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const result = await prisma.dashboard.deleteMany({ where: { id, projectId } });
    if (result.count === 0) return reply.code(404).send({ error: "Dashboard not found" });
    return reply.code(204).send();
  });
}

const publicPasswordSchema = z.object({ password: z.string().optional() });

export async function publicDashboardRoutes(app: FastifyInstance) {
  app.get("/public/dashboards/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const parsed = publicPasswordSchema.safeParse(request.query);
    const password = parsed.success ? parsed.data.password : undefined;

    const dashboard = await prisma.dashboard.findUnique({ where: { slug }, include: DASHBOARD_INCLUDE });
    if (!dashboard || dashboard.status !== "published") {
      return reply.code(404).send({ error: "Dashboard not found" });
    }

    if (dashboard.sharePasswordHash) {
      if (!password || !(await verifyPassword(password, dashboard.sharePasswordHash))) {
        return reply.code(401).send({ error: "Password required", locked: true });
      }
    }

    return reply.send({ dashboard: serializeDashboard(dashboard) });
  });
}
