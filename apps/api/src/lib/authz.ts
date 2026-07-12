import type { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "./supabase.js";

export type ProjectRole = "owner" | "editor" | "viewer";

export async function getProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
  const { data: project } = await supabase.from("projects").select("owner_id").eq("id", projectId).maybeSingle();
  if (!project) return null;
  if (project.owner_id === userId) return "owner";

  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return (member?.role as ProjectRole | undefined) ?? null;
}

const RANK: Record<ProjectRole, number> = { viewer: 0, editor: 1, owner: 2 };

export function roleAtLeast(role: ProjectRole | null, min: ProjectRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}

export function requireRole(minRole: ProjectRole, paramName = "id") {
  return async function requireRolePreHandler(request: FastifyRequest, reply: FastifyReply) {
    const projectId = (request.params as Record<string, string>)[paramName];
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, minRole)) return reply.code(404).send({ error: "Project not found" });
  };
}
