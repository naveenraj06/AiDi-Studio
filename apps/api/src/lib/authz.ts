import type { ProjectRole } from "@prisma/client";
import { prisma } from "./prisma.js";

export async function getProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project) return null;
  if (project.ownerId === userId) return "owner";

  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId },
    select: { role: true },
  });
  return membership?.role ?? null;
}

const RANK: Record<ProjectRole, number> = { viewer: 0, editor: 1, owner: 2 };

export function roleAtLeast(role: ProjectRole | null, min: ProjectRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}
