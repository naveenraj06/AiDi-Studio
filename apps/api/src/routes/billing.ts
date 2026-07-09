import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { serializeBilling, type BillingRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";

const BILLING_SELECT = "*, invoices(*)";

const updateSchema = z.object({
  plan: z.enum(["free", "pro", "team", "enterprise"]).optional(),
  seats: z.number().int().min(1).optional(),
});

async function getOrCreateBilling(projectId: string): Promise<BillingRow> {
  const { data: existing } = await supabase
    .from("billing")
    .select(BILLING_SELECT)
    .eq("project_id", projectId)
    .maybeSingle<BillingRow>();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("billing")
    .insert({ project_id: projectId })
    .select(BILLING_SELECT)
    .single<BillingRow>();
  if (error || !created) throw error ?? new Error("Failed to create billing record");
  return created;
}

export default async function billingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/billing", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    try {
      const billing = await getOrCreateBilling(projectId);
      return reply.send({ billing: serializeBilling(billing) });
    } catch {
      return reply.code(500).send({ error: "Failed to load billing" });
    }
  });

  app.patch("/projects/:projectId/billing", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    try {
      await getOrCreateBilling(projectId);
    } catch {
      return reply.code(500).send({ error: "Failed to load billing" });
    }

    const patch: Record<string, unknown> = {};
    if (parsed.data.plan !== undefined) patch.plan = parsed.data.plan;
    if (parsed.data.seats !== undefined) patch.seats = parsed.data.seats;

    const { data: billing, error } = await supabase
      .from("billing")
      .update(patch)
      .eq("project_id", projectId)
      .select(BILLING_SELECT)
      .single<BillingRow>();
    if (error || !billing) return reply.code(500).send({ error: "Failed to update billing" });
    return reply.send({ billing: serializeBilling(billing) });
  });
}
