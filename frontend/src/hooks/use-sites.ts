"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sitesApi } from "@/lib/api-client";

export function useSites() {
  return useQuery({ queryKey: ["sites"], queryFn: sitesApi.list });
}

export function useSite(id: number) {
  return useQuery({ queryKey: ["sites", id], queryFn: () => sitesApi.get(id) });
}

export function useSiteAnalyses(id: number) {
  return useQuery({ queryKey: ["sites", id, "analyses"], queryFn: () => sitesApi.analyses(id) });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sitesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sitesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useAnalyzeSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sitesApi.analyze(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["sites", id, "analyses"] });
    },
  });
}
