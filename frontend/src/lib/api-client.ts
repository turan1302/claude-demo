import type {
  ActionItem,
  ActionItemStatus,
  ActionPlan,
  AnalysisCompareResult,
  AppNotification,
  CompetitorComparison,
  DashboardSummary,
  FindingCategory,
  Integration,
  IntegrationProvider,
  Keyword,
  KeywordRanking,
  Priority,
  ReportFormat,
  ReportFrequency,
  ReportSubscription,
  Site,
  SiteAnalysis,
  User,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? "Bir hata oluştu.", response.status, data.errors);
  }

  return data as T;
}

// --- Auth ---

export const authApi = {
  // Laravel bu route'ta kaynağı doğrudan döndürüyor, bu yüzden otomatik
  // olarak {data: ...} ile sarmalanıyor (login/register'daki gibi bir
  // dizinin içine gömülü değil).
  me: () => apiFetch<{ data: User }>("/user").then((r) => r.data),
  updateProfile: (payload: { name: string; email: string }) =>
    apiFetch<{ data: User }>("/user", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  updatePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    apiFetch<void>("/user/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// --- Dashboard ---

export const dashboardApi = {
  summary: () => apiFetch<DashboardSummary>("/dashboard/summary"),
};

// --- Sites ---

export const sitesApi = {
  list: () => apiFetch<{ data: Site[] }>("/sites").then((r) => r.data),
  get: (id: number) => apiFetch<{ data: Site }>(`/sites/${id}`).then((r) => r.data),
  create: (payload: { url: string; name?: string }) =>
    apiFetch<{ site: Site; analysis: SiteAnalysis }>("/sites", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) => apiFetch<void>(`/sites/${id}`, { method: "DELETE" }),
  analyze: (id: number) =>
    apiFetch<{ analysis: SiteAnalysis }>(`/sites/${id}/analyze`, { method: "POST" }),
  analyses: (id: number) =>
    apiFetch<{ data: SiteAnalysis[] }>(`/sites/${id}/analyses`).then((r) => r.data),
};

// --- Competitors ---

export const competitorsApi = {
  list: (siteId: number) => apiFetch<{ data: Site[] }>(`/sites/${siteId}/competitors`).then((r) => r.data),
  create: (siteId: number, payload: { url: string; name?: string }) =>
    apiFetch<{ site: Site; analysis: SiteAnalysis }>(`/sites/${siteId}/competitors`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (competitorId: number) => apiFetch<void>(`/competitors/${competitorId}`, { method: "DELETE" }),
  compare: (siteId: number) => apiFetch<CompetitorComparison>(`/sites/${siteId}/compare-competitors`),
};

// --- Keywords ---

export const keywordsApi = {
  list: (siteId: number) => apiFetch<{ data: Keyword[] }>(`/sites/${siteId}/keywords`).then((r) => r.data),
  create: (siteId: number, payload: { keyword: string; location?: string }) =>
    apiFetch<{ data: Keyword }>(`/sites/${siteId}/keywords`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  remove: (keywordId: number) => apiFetch<void>(`/keywords/${keywordId}`, { method: "DELETE" }),
  rankings: (keywordId: number) => apiFetch<{ data: KeywordRanking[] }>(`/keywords/${keywordId}/rankings`).then((r) => r.data),
  check: (keywordId: number) => apiFetch<void>(`/keywords/${keywordId}/check`, { method: "POST" }),
};

// --- Report subscriptions ---

export const reportSubscriptionsApi = {
  list: () => apiFetch<{ data: ReportSubscription[] }>("/report-subscriptions").then((r) => r.data),
  create: (payload: { site_id: number | null; frequency: ReportFrequency; format: ReportFormat }) =>
    apiFetch<{ data: ReportSubscription }>("/report-subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  update: (id: number, payload: Partial<{ frequency: ReportFrequency; format: ReportFormat; is_active: boolean }>) =>
    apiFetch<{ data: ReportSubscription }>(`/report-subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  remove: (id: number) => apiFetch<void>(`/report-subscriptions/${id}`, { method: "DELETE" }),
  sendNow: (id: number) => apiFetch<void>(`/report-subscriptions/${id}/send-now`, { method: "POST" }),
};

// --- Notifications ---

export const notificationsApi = {
  list: () => apiFetch<{ data: AppNotification[] }>("/notifications").then((r) => r.data),
  unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count").then((r) => r.count),
  markRead: (id: string) => apiFetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),
  readAll: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
};

// --- Analyses ---

export const analysesApi = {
  get: (id: number) => apiFetch<{ data: SiteAnalysis }>(`/analyses/${id}`).then((r) => r.data),
  actionPlan: (id: number) =>
    apiFetch<{ data: ActionPlan }>(`/analyses/${id}/action-plan`).then((r) => r.data),
  compare: (fromId: number, toId: number) =>
    apiFetch<AnalysisCompareResult>(`/analyses/${fromId}/compare/${toId}`),
};

// --- Action items ---

export interface ActionItemFilters {
  status?: ActionItemStatus;
  priority?: Priority;
  category?: FindingCategory;
  site_id?: number;
  [key: string]: string | number | undefined;
}

function toQueryString(filters: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const actionItemsApi = {
  list: (filters: ActionItemFilters = {}) =>
    apiFetch<{ data: ActionItem[] }>(`/action-items${toQueryString(filters)}`).then((r) => r.data),
  update: (id: number, payload: { status?: ActionItemStatus; priority?: Priority }) =>
    apiFetch<{ data: ActionItem }>(`/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  reorder: (id: number, payload: { position: number; status?: ActionItemStatus }) =>
    apiFetch<{ data: ActionItem }>(`/action-items/${id}/reorder`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
};

// --- Integrations ---

export const integrationsApi = {
  list: () => apiFetch<{ data: Integration[] }>("/integrations").then((r) => r.data),
  create: (payload: { provider: IntegrationProvider; api_key: string }) =>
    apiFetch<{ data: Integration }>("/integrations", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  remove: (id: number) => apiFetch<void>(`/integrations/${id}`, { method: "DELETE" }),
};
