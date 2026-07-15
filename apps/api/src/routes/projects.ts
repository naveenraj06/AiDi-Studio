import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../lib/authz.js";
import { serializeProject, type ProjectRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

const PROJECT_SELECT = "*, dashboards:dashboards(count), widgets:widgets(count), resources:api_resources(count)";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name"),
  icon: z.string().trim().min(1).default("box"),
  color: z.string().trim().min(1).default("#7C5CFC"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
  plan: z.enum(["free", "pro", "org"]).optional(),
});

const FREE_PROJECT_LIMIT = 2;

export default async function projectRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects", async (request, reply) => {
    const { data: memberships } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", request.userId);
    const memberProjectIds = (memberships ?? []).map((m) => m.project_id as string);

    let query = supabase.from("projects").select(PROJECT_SELECT).order("created_at", { ascending: false });
    query = memberProjectIds.length
      ? query.or(`owner_id.eq.${request.userId},id.in.(${memberProjectIds.join(",")})`)
      : query.eq("owner_id", request.userId);

    const { data, error } = await query.returns<ProjectRow[]>();
    if (error) return reply.code(500).send({ error: "Failed to load projects" });
    return reply.send({ projects: (data ?? []).map(serializeProject) });
  });

  app.post("/projects", async (request, reply) => {
    const data = parseBody(createSchema, request, reply);
    if (!data) return;

    const { count: freeProjectCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", request.userId)
      .eq("plan", "free");
    if ((freeProjectCount ?? 0) >= FREE_PROJECT_LIMIT) {
      return reply
        .code(403)
        .send({ error: `Free accounts are limited to ${FREE_PROJECT_LIMIT} projects — upgrade one or remove an existing project` });
    }

    const { data: created, error: rpcError } = await supabase
      .rpc("create_project", {
        p_name: data.name,
        p_icon: data.icon,
        p_color: data.color,
        p_owner_id: request.userId,
        p_owner_name: request.userName,
        p_owner_email: request.userEmail,
      })
      .single<{ id: string }>();
    if (rpcError || !created) return reply.code(500).send({ error: "Failed to create project" });

    const { data: project, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", created.id)
      .single<ProjectRow>();
    if (error || !project) return reply.code(500).send({ error: "Failed to load created project" });
    return reply.code(201).send({ project: serializeProject(project) });
  });

  app.get("/projects/:id", { preHandler: [requireRole("viewer")] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const { data: project, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", id)
      .maybeSingle<ProjectRow>();
    if (error || !project) return reply.code(404).send({ error: "Project not found" });
    return reply.send({ project: serializeProject(project) });
  });

  app.patch("/projects/:id", { preHandler: [requireRole("editor")] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const data = parseBody(updateSchema, request, reply);
    if (!data) return;

    // See billing.ts's PATCH handler — "org" can only be granted through
    // POST /projects/:projectId/org, which verifies a business email.
    if (data.plan === "org") {
      return reply.code(400).send({ error: "Create an Org from the Org panel instead of switching plans directly" });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PROJECT_SELECT)
      .single<ProjectRow>();
    if (error || !project) return reply.code(500).send({ error: "Failed to update project" });

    // projects.plan and billing.plan are kept in sync — both the project settings
    // form and the billing page can change the plan, and gating logic elsewhere
    // only reads one of the two depending on which route loaded the data.
    // "org" is rejected above, so switching plans here always leaves Org.
    if (data.plan !== undefined) {
      await supabase.from("billing").update({ plan: data.plan }).eq("project_id", id);
      await supabase.from("projects").update({ org_id: null }).eq("id", id);
    }

    return reply.send({ project: serializeProject(project) });
  });

  app.delete("/projects/:id", { preHandler: [requireRole("owner")] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return reply.code(500).send({ error: "Failed to delete project" });
    return reply.code(204).send();
  });
}
