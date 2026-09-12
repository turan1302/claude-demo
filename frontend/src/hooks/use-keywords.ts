"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keywordsApi } from "@/lib/api-client";

export function useKeywords(siteId: number) {
  return useQuery({ queryKey: ["sites", siteId, "keywords"], queryFn: () => keywordsApi.list(siteId) });
}

export function useKeywordRankings(keywordId: number | undefined) {
  return useQuery({
    queryKey: ["keywords", keywordId, "rankings"],
    queryFn: () => keywordsApi.rankings(keywordId as number),
    enabled: keywordId !== undefined,
  });
}

export function useCreateKeyword(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { keyword: string; location?: string }) => keywordsApi.create(siteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "keywords"] });
    },
  });
}

export function useDeleteKeyword(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keywordId: number) => keywordsApi.remove(keywordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "keywords"] });
    },
  });
}

export function useCheckKeyword(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keywordId: number) => keywordsApi.check(keywordId),
    onSuccess: (_data, keywordId) => {
      queryClient.invalidateQueries({ queryKey: ["sites", siteId, "keywords"] });
      queryClient.invalidateQueries({ queryKey: ["keywords", keywordId, "rankings"] });
    },
  });
}
