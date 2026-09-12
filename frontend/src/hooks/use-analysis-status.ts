"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getEcho } from "@/lib/echo";
import type { AnalysisStatus } from "@/types/api";

interface AnalysisStatusEvent {
  id: number;
  site_id: number;
  status: AnalysisStatus;
  current_step: string | null;
  overall_seo_score: number | null;
  overall_geo_score: number | null;
  error_message: string | null;
}

/**
 * Bir analizin `private-site-analysis.{id}` kanalını dinler ve gelen
 * `SiteAnalysisStatusUpdated` event'lerinde ilgili React Query cache
 * girdilerini günceller — dashboard'daki tüm ekranlar sayfa yenilemeden
 * anlık ilerlemeyi görür.
 */
export function useAnalysisStatus(analysisId: number | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!analysisId) return;

    const echo = getEcho();
    const channelName = `site-analysis.${analysisId}`;
    const channel = echo.private(channelName);

    channel.listen(".SiteAnalysisStatusUpdated", (payload: AnalysisStatusEvent) => {
      queryClient.setQueryData(["analyses", analysisId], (old: Record<string, unknown> | undefined) =>
        old ? { ...old, ...payload } : old
      );

      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["sites", payload.site_id] });

      if (payload.status === "completed" || payload.status === "failed") {
        queryClient.invalidateQueries({ queryKey: ["analyses", analysisId] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      }
    });

    return () => {
      echo.leave(channelName);
    };
  }, [analysisId, queryClient]);
}
