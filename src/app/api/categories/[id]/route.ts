import { NextResponse } from "next/server";

import type {
  ArticleCategory,
  UpdateArticleCategory,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const input = (await request.json()) as UpdateArticleCategory;
  const result = await callAuthenticatedBackend<ArticleCategory>(
    `/categories/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return result
    ? upstreamJson(result, "The category could not be updated.")
    : sessionRequired();
}
