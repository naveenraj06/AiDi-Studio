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
