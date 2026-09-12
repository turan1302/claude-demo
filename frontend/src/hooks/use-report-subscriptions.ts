"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportSubscriptionsApi } from "@/lib/api-client";
import type { ReportFormat, ReportFrequency } from "@/types/api";

export function useReportSubscriptions() {
  return useQuery({ queryKey: ["report-subscriptions"], queryFn: reportSubscriptionsApi.list });
}

export function useCreateReportSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { site_id: number | null; frequency: ReportFrequency; format: ReportFormat }) =>
      reportSubscriptionsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report-subscriptions"] }),
  });
}

export function useUpdateReportSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; is_active?: boolean; frequency?: ReportFrequency; format?: ReportFormat }) =>
      reportSubscriptionsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report-subscriptions"] }),
  });
}

export function useDeleteReportSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportSubscriptionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report-subscriptions"] }),
  });
}

export function useSendReportNow() {
  return useMutation({
    mutationFn: (id: number) => reportSubscriptionsApi.sendNow(id),
  });
}
