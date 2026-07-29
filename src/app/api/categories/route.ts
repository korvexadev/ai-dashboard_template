import { NextResponse } from "next/server";

import type {
  ArticleCategory,
  ArticleCategoryCollection,
  CreateArticleCategory,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const query = new URLSearchParams();
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  const suffix = query.size ? `?${query.toString()}` : "";
  const result = await callAuthenticatedBackend<ArticleCategoryCollection>(
    `/categories${suffix}`,
  );
  return result
    ? upstreamJson(result, "Categories could not be loaded.")
    : sessionRequired();
}

export async function POST(request: Request): Promise<NextResponse> {
  const input = (await request.json()) as CreateArticleCategory;
  const result = await callAuthenticatedBackend<ArticleCategory>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return result
    ? upstreamJson(result, "The category could not be created.")
    : sessionRequired();
}
