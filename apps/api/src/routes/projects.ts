import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { prisma } from "../lib/prisma.js";
import { serializeProject } from "../lib/serialize.js";

const PROJECT_COUNTS = { _count: { select: { dashboards: true, widgets: true, resources: true } } } as const;

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name"),
  icon: z.string().trim().min(1).default("box"),
  color: z.string().trim().min(1).default("#7C5CFC"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
  plan: z.enum(["free", "pro", "team", "enterprise"]).optional(),
});

export default async function projectRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects", async (request, reply) => {
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: request.userId }, { members: { some: { userId: request.userId } } }],
      },
      include: PROJECT_COUNTS,
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ projects: projects.map(serializeProject) });
  });

  app.post("/projects", async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.userId } });
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        ownerId: request.userId,
        members: {
          create: { userId: request.userId, name: user.displayName, email: user.email, role: "owner" },
        },
        billing: { create: {} },
      },
      include: PROJECT_COUNTS,
    });
    return reply.code(201).send({ project: serializeProject(project) });
  });

  app.get("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const project = await prisma.project.findUnique({ where: { id }, include: PROJECT_COUNTS });
    if (!project) return reply.code(404).send({ error: "Project not found" });
    return reply.send({ project: serializeProject(project) });
  });

  app.patch("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const project = await prisma.project.update({ where: { id }, data: parsed.data, include: PROJECT_COUNTS });
    return reply.send({ project: serializeProject(project) });
  });

  app.delete("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    await prisma.project.delete({ where: { id } });
    return reply.code(204).send();
  });
}
