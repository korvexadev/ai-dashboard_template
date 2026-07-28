import type {
  Article,
  ArticleCollection,
  CreateArticle,
  UpdateArticle,
  UpdateArticleStatus,
} from "@/lib/api/contracts";

export async function listArticles(
  params: URLSearchParams,
): Promise<ArticleCollection> {
  return request<ArticleCollection>(`/api/articles?${params.toString()}`);
}

export async function getArticle(slug: string): Promise<Article> {
  return request<Article>(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function createArticle(input: CreateArticle): Promise<Article> {
  return request<Article>("/api/articles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateArticle(
  slug: string,
  input: UpdateArticle,
): Promise<Article> {
  return request<Article>(`/api/articles/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateArticleStatus(
  slug: string,
  input: UpdateArticleStatus,
): Promise<Article> {
  return request<Article>(`/api/articles/${encodeURIComponent(slug)}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteArticle(
  slug: string,
  expectedVersion: number,
): Promise<void> {
  await request<void>(
    `/api/articles/${encodeURIComponent(slug)}?expectedVersion=${expectedVersion}`,
    { method: "DELETE" },
  );
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  if (response.status === 204) return undefined as T;

  const body = (await response.json()) as T & {
    error?: { code: string; message: string };
  };

  if (!response.ok) {
    throw new ArticleApiError(
      response.status,
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "The newsroom request failed.",
    );
  }
  return body;
}

export class ArticleApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
