"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api-client";

export function useDashboardSummary() {
  return useQuery({ queryKey: ["dashboard-summary"], queryFn: dashboardApi.summary });
}
