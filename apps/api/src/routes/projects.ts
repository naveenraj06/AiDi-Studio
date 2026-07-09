import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { serializeProject, type ProjectRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";

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
  plan: z.enum(["free", "pro", "team", "enterprise"]).optional(),
});

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
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: created, error: rpcError } = await supabase
      .rpc("create_project", {
        p_name: parsed.data.name,
        p_icon: parsed.data.icon,
        p_color: parsed.data.color,
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

  app.get("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const { data: project, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", id)
      .maybeSingle<ProjectRow>();
    if (error || !project) return reply.code(404).send({ error: "Project not found" });
    return reply.send({ project: serializeProject(project) });
  });

  app.patch("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: project, error } = await supabase
      .from("projects")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PROJECT_SELECT)
      .single<ProjectRow>();
    if (error || !project) return reply.code(500).send({ error: "Failed to update project" });
    return reply.send({ project: serializeProject(project) });
  });

  app.delete("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await getProjectRole(request.userId, id);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return reply.code(500).send({ error: "Failed to delete project" });
    return reply.code(204).send();
  });
}
