"use client";

import { useQuery } from "@tanstack/react-query";
import { analysesApi } from "@/lib/api-client";

export function useAnalysis(id: number | undefined) {
  return useQuery({
    queryKey: ["analyses", id],
    queryFn: () => analysesApi.get(id as number),
    enabled: id !== undefined,
  });
}

export function useActionPlan(analysisId: number | undefined) {
  return useQuery({
    queryKey: ["analyses", analysisId, "action-plan"],
    queryFn: () => analysesApi.actionPlan(analysisId as number),
    enabled: analysisId !== undefined,
  });
}

export function useCompareAnalyses(fromId: number | undefined, toId: number | undefined) {
  return useQuery({
    queryKey: ["analyses", fromId, "compare", toId],
    queryFn: () => analysesApi.compare(fromId as number, toId as number),
    enabled: fromId !== undefined && toId !== undefined,
  });
}
