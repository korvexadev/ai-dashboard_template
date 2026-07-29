import type {
  AdminHomepageLayout,
  ArticleCollection,
  HomepageSnapshot,
  SaveHomepageLayout,
} from "@/lib/api/contracts";

export function getHomepageLayout(): Promise<AdminHomepageLayout> {
  return request<AdminHomepageLayout>("/api/homepage-layout");
}

export function saveHomepageLayout(
  input: SaveHomepageLayout,
): Promise<AdminHomepageLayout> {
  return request<AdminHomepageLayout>("/api/homepage-layout", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getHomepagePreview(): Promise<HomepageSnapshot> {
  return request<HomepageSnapshot>("/api/homepage-layout/preview");
}

export function getPublishedArticles(): Promise<ArticleCollection> {
  return request<ArticleCollection>(
    "/api/articles?status=published&sortBy=updatedAt&sortDirection=desc&limit=100&offset=0",
  );
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = (await response.json()) as T & {
    error?: { code: string; message: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The homepage request failed.");
  }
  return body;
}
