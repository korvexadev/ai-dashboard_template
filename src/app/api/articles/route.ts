import { NextResponse } from "next/server";

import type {
  Article,
  ArticleCollection,
  CreateArticle,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const result = await callAuthenticatedBackend<ArticleCollection>(
      `/articles${query ? `?${query}` : ""}`,
    );
    return result
      ? upstreamJson(result, "Articles could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("Articles could not be loaded.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as CreateArticle;
    const result = await callAuthenticatedBackend<Article>("/articles", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result
      ? upstreamJson(result, "The article could not be created.")
      : sessionRequired();
  } catch {
    return unavailable("The article could not be created.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "NEWSROOM_UNAVAILABLE", message } },
    { status: 503 },
  );
}
