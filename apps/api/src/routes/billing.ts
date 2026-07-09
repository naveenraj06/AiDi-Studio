import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { prisma } from "../lib/prisma.js";
import { serializeBilling } from "../lib/serialize.js";

const BILLING_INCLUDE = { invoices: { orderBy: { date: "desc" as const } } } as const;

const updateSchema = z.object({
  plan: z.enum(["free", "pro", "team", "enterprise"]).optional(),
  seats: z.number().int().min(1).optional(),
});

export default async function billingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/billing", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const billing = await prisma.billing.upsert({
      where: { projectId },
      update: {},
      create: { projectId },
      include: BILLING_INCLUDE,
    });
    return reply.send({ billing: serializeBilling(billing) });
  });

  // Note: no real payment processor is wired up yet — this updates plan/seat records only.
  app.patch("/projects/:projectId/billing", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const billing = await prisma.billing.upsert({
      where: { projectId },
      update: parsed.data,
      create: { projectId, ...parsed.data },
      include: BILLING_INCLUDE,
    });
    return reply.send({ billing: serializeBilling(billing) });
  });
}
