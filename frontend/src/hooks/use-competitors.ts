"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { competitorsApi } from "@/lib/api-client";

export function useCompetitors(siteId: number) {
  return useQuery({ queryKey: ["sites", siteId, "competitors"], queryFn: () => competitorsApi.list(siteId) });
}

export function useCompetitorComparison(siteId: number) {
  return useQuery({ queryKey: ["sites", siteId, "compare-competitors"], queryFn: () => competitorsApi.compare(siteId) });
}

export function useCreateCompetitor(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { url: string; name?: string }) => competitorsApi.create(siteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "competitors"] });
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "compare-competitors"] });
    },
  });
}

export function useDeleteCompetitor(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competitorId: number) => competitorsApi.remove(competitorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "competitors"] });
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "compare-competitors"] });
    },
  });
}
