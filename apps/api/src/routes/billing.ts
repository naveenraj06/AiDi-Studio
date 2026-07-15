import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../lib/authz.js";
import { serializeBilling, type BillingRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

const BILLING_SELECT = "*, invoices(*)";

const updateSchema = z.object({
  plan: z.enum(["free", "pro", "org"]).optional(),
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

  app.get(
    "/projects/:projectId/billing",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      try {
        const billing = await getOrCreateBilling(projectId);
        return reply.send({ billing: serializeBilling(billing) });
      } catch {
        return reply.code(500).send({ error: "Failed to load billing" });
      }
    },
  );

  app.patch(
    "/projects/:projectId/billing",
    { preHandler: [requireRole("owner", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(updateSchema, request, reply);
      if (!data) return;

      // "Org" can only be reached through POST /projects/:projectId/org, which
      // verifies a business email and links the project to an Org record —
      // this generic plan switch must not be able to grant it directly.
      if (data.plan === "org") {
        return reply.code(400).send({ error: "Create an Org from the Org panel instead of switching plans directly" });
      }

      try {
        await getOrCreateBilling(projectId);
      } catch {
        return reply.code(500).send({ error: "Failed to load billing" });
      }

      const patch: Record<string, unknown> = {};
      if (data.plan !== undefined) patch.plan = data.plan;
      if (data.seats !== undefined) patch.seats = data.seats;

      const { data: billing, error } = await supabase
        .from("billing")
        .update(patch)
        .eq("project_id", projectId)
        .select(BILLING_SELECT)
        .single<BillingRow>();
      if (error || !billing) return reply.code(500).send({ error: "Failed to update billing" });

      // See projects.ts's PATCH handler — projects.plan and billing.plan are kept in
      // sync. "org" is rejected above, so switching plans here always leaves Org.
      if (data.plan !== undefined) {
        await supabase.from("projects").update({ plan: data.plan, org_id: null }).eq("id", projectId);
      }

      return reply.send({ billing: serializeBilling(billing) });
    },
  );
}
