"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actionItemsApi, type ActionItemFilters } from "@/lib/api-client";
import type { ActionItemStatus, Priority } from "@/types/api";

export function useActionItems(filters: ActionItemFilters = {}) {
  return useQuery({
    queryKey: ["action-items", filters],
    queryFn: () => actionItemsApi.list(filters),
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status?: ActionItemStatus; priority?: Priority }) =>
      actionItemsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useReorderActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; position: number; status?: ActionItemStatus }) =>
      actionItemsApi.reorder(id, payload),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["action-items"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
