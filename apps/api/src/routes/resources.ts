import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { prisma } from "../lib/prisma.js";
import { serializeResource } from "../lib/serialize.js";
import { assertPublicHttpUrl } from "../lib/ssrfGuard.js";

const RESOURCE_COUNTS = { _count: { select: { widgets: true } } } as const;

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a resource name"),
  url: z.string().trim().url("Enter a valid URL"),
  authType: z.enum(["bearer", "api_key", "oauth", "none"]).default("none"),
  authCredential: z.string().trim().optional(),
  importedFrom: z.enum(["postman", "openapi", "curl", "manual"]).default("manual"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  url: z.string().trim().url().optional(),
  authType: z.enum(["bearer", "api_key", "oauth", "none"]).optional(),
  authCredential: z.string().trim().optional(),
});

export default async function resourceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/resources", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const resources = await prisma.apiResource.findMany({
      where: { projectId },
      include: RESOURCE_COUNTS,
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ resources: resources.map(serializeResource) });
  });

  app.post("/projects/:projectId/resources", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const resource = await prisma.apiResource.create({
      data: { ...parsed.data, projectId },
      include: RESOURCE_COUNTS,
    });
    return reply.code(201).send({ resource: serializeResource(resource) });
  });

  app.patch("/projects/:projectId/resources/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const resource = await prisma.apiResource.updateMany({ where: { id, projectId }, data: parsed.data });
    if (resource.count === 0) return reply.code(404).send({ error: "Resource not found" });

    const updated = await prisma.apiResource.findUnique({ where: { id }, include: RESOURCE_COUNTS });
    return reply.send({ resource: serializeResource(updated!) });
  });

  app.delete("/projects/:projectId/resources/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const result = await prisma.apiResource.deleteMany({ where: { id, projectId } });
    if (result.count === 0) return reply.code(404).send({ error: "Resource not found" });
    return reply.code(204).send();
  });

  app.post("/projects/:projectId/resources/:id/test-connection", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const resource = await prisma.apiResource.findFirst({ where: { id, projectId } });
    if (!resource) return reply.code(404).send({ error: "Resource not found" });

    const startedAt = Date.now();
    let status: "healthy" | "error" = "error";
    try {
      const url = assertPublicHttpUrl(resource.url);
      const headers: Record<string, string> = {};
      if (resource.authType === "bearer" && resource.authCredential) {
        headers.Authorization = `Bearer ${resource.authCredential}`;
      } else if (resource.authType === "api_key" && resource.authCredential) {
        headers["X-API-Key"] = resource.authCredential;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
      clearTimeout(timeout);
      status = res.ok ? "healthy" : "error";
    } catch {
      status = "error";
    }
    const latencyMs = Date.now() - startedAt;

    const updated = await prisma.apiResource.update({
      where: { id },
      data: { status, lastTestedAt: new Date(), lastTestLatencyMs: latencyMs },
      include: RESOURCE_COUNTS,
    });
    return reply.send({ resource: serializeResource(updated) });
  });
}
