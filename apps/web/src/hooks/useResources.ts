import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { ApiResource, AuthType } from "@/types";

export function useResources(projectId: string | undefined) {
  return useQuery({
    queryKey: ["resources", projectId],
    queryFn: () =>
      apiGet<{ resources: ApiResource[] }>(`/projects/${projectId}/resources`).then((r) => r.resources),
    enabled: !!projectId,
  });
}

export interface CreateResourceInput {
  name: string;
  url: string;
  authType?: AuthType;
  authCredential?: string;
  importedFrom?: "postman" | "openapi" | "curl" | "manual";
}

export function useCreateResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResourceInput) =>
      apiPost<{ resource: ApiResource }>(`/projects/${projectId}/resources`, input).then((r) => r.resource),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", projectId] }),
  });
}

export interface UpdateResourceInput {
  name?: string;
  url?: string;
  authType?: AuthType;
  authCredential?: string;
}

export function useUpdateResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResourceInput }) =>
      apiPatch<{ resource: ApiResource }>(`/projects/${projectId}/resources/${id}`, input).then(
        (r) => r.resource,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", projectId] }),
  });
}

export function useDeleteResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/projects/${projectId}/resources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", projectId] }),
  });
}

export function useTestResourceConnection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ resource: ApiResource }>(`/projects/${projectId}/resources/${id}/test-connection`).then(
        (r) => r.resource,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", projectId] }),
  });
}
