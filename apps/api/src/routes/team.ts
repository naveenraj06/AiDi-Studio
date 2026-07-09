import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { serializeTeamMember, type TeamMemberRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";

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

    const { data, error } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .order("invited_at", { ascending: true })
      .returns<TeamMemberRow[]>();
    if (error) return reply.code(500).send({ error: "Failed to load team" });
    return reply.send({ team: (data ?? []).map(serializeTeamMember) });
  });

  app.post("/projects/:projectId/team", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: member, error } = await supabase
      .from("project_members")
      .insert({ project_id: projectId, name: parsed.data.name, email: parsed.data.email, role: parsed.data.role })
      .select("*")
      .single<TeamMemberRow>();
    if (error) {
      if (error.code === "23505") return reply.code(409).send({ error: "That person is already on the team" });
      return reply.code(500).send({ error: "Failed to invite team member" });
    }
    return reply.code(201).send({ member: serializeTeamMember(member) });
  });

  app.patch("/projects/:projectId/team/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: target } = await supabase
      .from("project_members")
      .select("role")
      .eq("id", id)
      .eq("project_id", projectId)
      .maybeSingle();
    if (!target) return reply.code(404).send({ error: "Team member not found" });

    if (target.role === "owner" && parsed.data.role !== "owner") {
      const { count } = await supabase
        .from("project_members")
        .select("id", { count: "exact", head: true })
        .eq("project_id", projectId)
        .eq("role", "owner");
      if ((count ?? 0) <= 1) return reply.code(400).send({ error: "A project must have at least one owner" });
    }

    const { data: member, error } = await supabase
      .from("project_members")
      .update({ role: parsed.data.role })
      .eq("id", id)
      .select("*")
      .single<TeamMemberRow>();
    if (error || !member) return reply.code(500).send({ error: "Failed to update team member" });
    return reply.send({ member: serializeTeamMember(member) });
  });

  app.delete("/projects/:projectId/team/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "owner")) return reply.code(404).send({ error: "Project not found" });

    const { data: target } = await supabase
      .from("project_members")
      .select("role")
      .eq("id", id)
      .eq("project_id", projectId)
      .maybeSingle();
    if (!target) return reply.code(404).send({ error: "Team member not found" });
    if (target.role === "owner") return reply.code(400).send({ error: "Remove another owner first" });

    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (error) return reply.code(500).send({ error: "Failed to remove team member" });
    return reply.code(204).send();
  });
}
