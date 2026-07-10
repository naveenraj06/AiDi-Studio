import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Plan, Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<{ projects: Project[] }>("/projects").then((r) => r.projects),
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => apiGet<{ project: Project }>(`/projects/${projectId}`).then((r) => r.project),
    enabled: !!projectId,
  });
}

export interface CreateProjectInput {
  name: string;
  icon?: string;
  color?: string;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiPost<{ project: Project }>("/projects", input).then((r) => r.project),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export interface UpdateProjectInput {
  name?: string;
  icon?: string;
  color?: string;
  plan?: Plan;
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      apiPatch<{ project: Project }>(`/projects/${projectId}`, input).then((r) => r.project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiDelete(`/projects/${projectId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
