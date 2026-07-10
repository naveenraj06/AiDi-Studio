import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import type { Billing, Plan } from "@/types";

export function useBilling(projectId: string | undefined) {
  return useQuery({
    queryKey: ["billing", projectId],
    queryFn: () => apiGet<{ billing: Billing }>(`/projects/${projectId}/billing`).then((r) => r.billing),
    enabled: !!projectId,
  });
}

export interface UpdateBillingInput {
  plan?: Plan;
  seats?: number;
}

export function useUpdateBilling(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBillingInput) =>
      apiPatch<{ billing: Billing }>(`/projects/${projectId}/billing`, input).then((r) => r.billing),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing", projectId] }),
  });
}
