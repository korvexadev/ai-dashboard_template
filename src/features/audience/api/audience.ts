import type {
  AudienceUserCollection,
  AudienceUserDetail,
  AudienceUserStatus,
  CommentActivityCollection,
  LikeActivityCollection,
  ReaderEntitlement,
  SubscriptionActivityCollection,
  TransactionActivityCollection,
} from "@/lib/api/contracts";

export type AudienceHistoryCategory =
  | "comments"
  | "likes"
  | "subscriptions"
  | "transactions";

export type AudienceHistoryCollection =
  | CommentActivityCollection
  | LikeActivityCollection
  | SubscriptionActivityCollection
  | TransactionActivityCollection;

export function listAudience(
  query: URLSearchParams,
): Promise<AudienceUserCollection> {
  return request<AudienceUserCollection>(
    `/api/audience/users?${query.toString()}`,
  );
}

export function getAudienceUser(id: string): Promise<AudienceUserDetail> {
  return request<AudienceUserDetail>(
    `/api/audience/users/${encodeURIComponent(id)}`,
  );
}

export function assignAudienceSubscription(
  id: string,
  planId: string,
): Promise<ReaderEntitlement> {
  return request<ReaderEntitlement>(
    `/api/audience/users/${encodeURIComponent(id)}/subscription`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planId }),
    },
  );
}

export function updateAudienceUserStatus(
  id: string,
  status: "active" | "disabled",
): Promise<AudienceUserStatus> {
  return request<AudienceUserStatus>(
    `/api/audience/users/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteAudienceUser(id: string): Promise<void> {
  const response = await fetch(
    `/api/audience/users/${encodeURIComponent(id)}`,
    { method: "DELETE", cache: "no-store" },
  );
  if (response.ok) return;
  const body = (await response.json()) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "The account could not be deleted.");
}

export function getAudienceHistory(
  id: string,
  category: AudienceHistoryCategory,
): Promise<AudienceHistoryCollection> {
  return request<AudienceHistoryCollection>(
    `/api/audience/users/${encodeURIComponent(id)}/history/${category}?limit=25&offset=0`,
  );
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
