import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { prisma } from "../lib/prisma.js";
import { serializeTeamMember } from "../lib/serialize.js";

const inviteSchema = z.object({
  name: z.string().trim().min(1, "Enter a name"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["editor", "viewer"]).default("viewer"),
});

const updateSchema = z.object({
  role: z.enum(["owner", "editor", "viewer"]),
});

export default async function teamRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/team", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const members = await prisma.projectMember.findMany({ where: { projectId }, orderBy: { invitedAt: "asc" } });
    return reply.send({ team: members.map(serializeTeamMember) });
  });

  app.post("/projects/:projectId/team", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_email: { projectId, email: parsed.data.email } },
    });
    if (existing) return reply.code(409).send({ error: "That person is already on the team" });

    const linkedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const member = await prisma.projectMember.create({
      data: { ...parsed.data, projectId, userId: linkedUser?.id },
    });
    return reply.code(201).send({ member: serializeTeamMember(member) });
  });

  app.patch("/projects/:projectId/team/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const target = await prisma.projectMember.findFirst({ where: { id, projectId } });
    if (!target) return reply.code(404).send({ error: "Team member not found" });

    if (target.role === "owner" && parsed.data.role !== "owner") {
      const ownerCount = await prisma.projectMember.count({ where: { projectId, role: "owner" } });
      if (ownerCount <= 1) return reply.code(400).send({ error: "A project must have at least one owner" });
    }

    const member = await prisma.projectMember.update({ where: { id }, data: { role: parsed.data.role } });
    return reply.send({ member: serializeTeamMember(member) });
  });

  app.delete("/projects/:projectId/team/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const target = await prisma.projectMember.findFirst({ where: { id, projectId } });
    if (!target) return reply.code(404).send({ error: "Team member not found" });
    if (target.role === "owner") return reply.code(400).send({ error: "Remove another owner first" });

    await prisma.projectMember.delete({ where: { id } });
    return reply.code(204).send();
  });
}
