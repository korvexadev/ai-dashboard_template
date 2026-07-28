import type {
  CreateNotificationDraft,
  NotificationDraft,
  NotificationDraftCollection,
  UpdateNotificationDraft,
} from "@/lib/api/contracts";

export function listNotificationDrafts(
  query: URLSearchParams,
): Promise<NotificationDraftCollection> {
  return request(`/api/notification-drafts?${query.toString()}`);
}

export function createNotificationDraft(
  input: CreateNotificationDraft,
): Promise<NotificationDraft> {
  return request("/api/notification-drafts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateNotificationDraft(
  id: string,
  input: UpdateNotificationDraft,
): Promise<NotificationDraft> {
  return request(`/api/notification-drafts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = (await response.json()) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(
      body.error?.message ?? "The request could not be completed.",
    );
  }
  return body;
}
