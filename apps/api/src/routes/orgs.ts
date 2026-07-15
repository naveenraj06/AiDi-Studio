import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { isBusinessEmail } from "../lib/freeEmailDomains.js";
import { requireRole } from "../lib/authz.js";
import { serializeOrg, type OrgRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

const createOrgSchema = z.object({
  name: z.string().trim().min(1, "Enter an org name"),
});

export default async function orgRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/orgs/mine", async (request, reply) => {
    const domain = request.userEmail.split("@")[1]?.toLowerCase();
    if (!domain) return reply.send({ org: null });

    const { data: org } = await supabase.from("orgs").select("*").eq("domain", domain).maybeSingle<OrgRow>();
    return reply.send({ org: org ? serializeOrg(org) : null });
  });

  // Turns a project you own into an Org project: creates (or reuses) the Org
  // for your email's domain and links this project to it. One Org per domain —
  // if another account already owns it, they must invite you instead.
  app.post(
    "/projects/:projectId/org",
    { preHandler: [requireRole("owner", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(createOrgSchema, request, reply);
      if (!data) return;

      if (!isBusinessEmail(request.userEmail)) {
        return reply.code(400).send({ error: "Use a business email to create an Org" });
      }
      const domain = request.userEmail.split("@")[1]!.toLowerCase();

      const { data: existing } = await supabase.from("orgs").select("*").eq("domain", domain).maybeSingle<OrgRow>();
      let org = existing;
      if (org && org.owner_id !== request.userId) {
        return reply
          .code(409)
          .send({ error: `An Org already exists for ${domain} — ask its owner to invite you` });
      }
      if (!org) {
        const { data: created, error } = await supabase
          .from("orgs")
          .insert({ name: data.name, domain, owner_id: request.userId })
          .select("*")
          .single<OrgRow>();
        if (error || !created) return reply.code(500).send({ error: "Failed to create Org" });
        org = created;
      }

      const { error: linkError } = await supabase
        .from("projects")
        .update({ org_id: org.id, plan: "org" })
        .eq("id", projectId);
      if (linkError) return reply.code(500).send({ error: "Failed to link project to Org" });
      await supabase.from("billing").update({ plan: "org" }).eq("project_id", projectId);

      return reply.code(201).send({ org: serializeOrg(org) });
    },
  );
}
