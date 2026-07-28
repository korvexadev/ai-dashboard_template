import type {
  AudienceUserCollection,
  AudienceUserDetail,
  ReaderEntitlement,
} from "@/lib/api/contracts";

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
