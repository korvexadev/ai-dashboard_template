import { NextResponse } from "next/server";

import type { Article, UpdateArticleStatus } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;
    const current = await callAuthenticatedBackend<Article>(
      `/articles/slug/${encodeURIComponent(slug)}`,
    );
    if (!current) return sessionRequired();
    if (current.status < 200 || current.status >= 300) {
      return upstreamJson(current, "The article could not be loaded.");
    }
    const input = (await request.json()) as UpdateArticleStatus;
    const result = await callAuthenticatedBackend<Article>(
      `/articles/${current.body.data.id}/status`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The article status could not be changed.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "NEWSROOM_UNAVAILABLE",
          message: "The article status could not be changed.",
        },
      },
      { status: 503 },
    );
  }
}
