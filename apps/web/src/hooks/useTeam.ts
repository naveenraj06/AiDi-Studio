import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { ProjectRole, TeamMember } from "@/types";

export function useTeam(projectId: string | undefined) {
  return useQuery({
    queryKey: ["team", projectId],
    queryFn: () => apiGet<{ team: TeamMember[] }>(`/projects/${projectId}/team`).then((r) => r.team),
    enabled: !!projectId,
  });
}

export interface InviteMemberInput {
  name: string;
  email: string;
  role?: "editor" | "viewer";
}

export function useInviteMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      apiPost<{ member: TeamMember }>(`/projects/${projectId}/team`, input).then((r) => r.member),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", projectId] }),
  });
}

export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: ProjectRole }) =>
      apiPatch<{ member: TeamMember }>(`/projects/${projectId}/team/${id}`, { role }).then((r) => r.member),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", projectId] }),
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/projects/${projectId}/team/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", projectId] }),
  });
}
