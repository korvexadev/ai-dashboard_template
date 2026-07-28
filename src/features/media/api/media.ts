import type {
  CreateMediaAsset,
  MediaAsset,
  MediaAssetCollection,
  UpdateMediaAsset,
} from "@/lib/api/contracts";

export function listMedia(
  query: URLSearchParams,
): Promise<MediaAssetCollection> {
  return request(`/api/media-assets?${query.toString()}`);
}

export function createMedia(input: CreateMediaAsset): Promise<MediaAsset> {
  return request("/api/media-assets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateMedia(
  id: string,
  input: UpdateMediaAsset,
): Promise<MediaAsset> {
  return request(`/api/media-assets/${encodeURIComponent(id)}`, {
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
