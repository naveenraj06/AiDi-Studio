import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../lib/authz.js";
import { serializeTeamMember, type TeamMemberRow } from "../lib/serialize.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

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

  app.get(
    "/projects/:projectId/team",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const { data, error } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .order("invited_at", { ascending: true })
        .returns<TeamMemberRow[]>();
      if (error) return reply.code(500).send({ error: "Failed to load team" });
      return reply.send({ team: (data ?? []).map(serializeTeamMember) });
    },
  );

  app.post(
    "/projects/:projectId/team",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(inviteSchema, request, reply);
      if (!data) return;

      const { data: project } = await supabase
        .from("projects")
        .select("plan, org_id")
        .eq("id", projectId)
        .maybeSingle();
      if (project?.plan !== "org") {
        return reply.code(403).send({ error: "Upgrade this project to Org to add teammates" });
      }

      if (project.org_id) {
        const { data: org } = await supabase.from("orgs").select("domain").eq("id", project.org_id).maybeSingle();
        const invitedDomain = data.email.split("@")[1]?.toLowerCase();
        if (org && invitedDomain !== org.domain) {
          return reply.code(400).send({ error: `Teammates must use an @${org.domain} email address` });
        }
      }

      const { data: member, error } = await supabase
        .from("project_members")
        .insert({ project_id: projectId, name: data.name, email: data.email, role: data.role })
        .select("*")
        .single<TeamMemberRow>();
      if (error) {
        if (error.code === "23505") return reply.code(409).send({ error: "That person is already on the team" });
        return reply.code(500).send({ error: "Failed to invite team member" });
      }
      return reply.code(201).send({ member: serializeTeamMember(member) });
    },
  );

  app.patch(
    "/projects/:projectId/team/:id",
    { preHandler: [requireRole("owner", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

      const data = parseBody(updateSchema, request, reply);
      if (!data) return;

      const { data: target } = await supabase
        .from("project_members")
        .select("role")
        .eq("id", id)
        .eq("project_id", projectId)
        .maybeSingle();
      if (!target) return reply.code(404).send({ error: "Team member not found" });

      if (target.role === "owner" && data.role !== "owner") {
        const { count } = await supabase
          .from("project_members")
          .select("id", { count: "exact", head: true })
          .eq("project_id", projectId)
          .eq("role", "owner");
        if ((count ?? 0) <= 1) return reply.code(400).send({ error: "A project must have at least one owner" });
      }

      const { data: member, error } = await supabase
        .from("project_members")
        .update({ role: data.role })
        .eq("id", id)
        .select("*")
        .single<TeamMemberRow>();
      if (error || !member) return reply.code(500).send({ error: "Failed to update team member" });
      return reply.send({ member: serializeTeamMember(member) });
    },
  );

  app.delete(
    "/projects/:projectId/team/:id",
    { preHandler: [requireRole("owner", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };

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
    },
  );
}
