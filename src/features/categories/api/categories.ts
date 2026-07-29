import type {
  ArticleCategory,
  ArticleCategoryCollection,
  CreateArticleCategory,
  UpdateArticleCategory,
} from "@/lib/api/contracts";

export interface CategoryFilters {
  search?: string;
  status?: "active" | "archived";
}

export async function getCategories(
  filters: CategoryFilters = {},
): Promise<ArticleCategory[]> {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  const suffix = query.size ? `?${query.toString()}` : "";
  return (await request<ArticleCategoryCollection>(`/api/categories${suffix}`))
    .items;
}

export function createCategory(
  input: CreateArticleCategory,
): Promise<ArticleCategory> {
  return request<ArticleCategory>("/api/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateCategory(
  id: string,
  input: UpdateArticleCategory,
): Promise<ArticleCategory> {
  return request<ArticleCategory>(`/api/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = (await response.json()) as T & {
    error?: { code: string; message: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The category request failed.");
  }
  return body;
}
