import { NextResponse } from "next/server";

import type { Article, UpdateArticle } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;
    const result = await callAuthenticatedBackend<Article>(
      `/articles/slug/${encodeURIComponent(slug)}`,
    );
    return result
      ? upstreamJson(result, "The article could not be loaded.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "NEWSROOM_UNAVAILABLE",
          message: "The article could not be loaded.",
        },
      },
      { status: 503 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;
    const current = await findBySlug(slug);
    if (!current) return sessionRequired();
    if (current.status < 200 || current.status >= 300) {
      return upstreamJson(current, "The article could not be loaded.");
    }
    const input = (await request.json()) as UpdateArticle;
    const result = await callAuthenticatedBackend<Article>(
      `/articles/${current.body.data.id}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The article could not be updated.")
      : sessionRequired();
  } catch {
    return unavailable("The article could not be updated.");
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;
    const current = await findBySlug(slug);
    if (!current) return sessionRequired();
    if (current.status < 200 || current.status >= 300) {
      return upstreamJson(current, "The article could not be loaded.");
    }
    const expectedVersion = new URL(request.url).searchParams.get(
      "expectedVersion",
    );
    const result = await callAuthenticatedBackend<never>(
      `/articles/${current.body.data.id}?expectedVersion=${encodeURIComponent(expectedVersion ?? "")}`,
      { method: "DELETE" },
    );
    if (!result) return sessionRequired();
    if (result.status === 204) return new NextResponse(null, { status: 204 });
    return upstreamJson(result, "The article could not be deleted.");
  } catch {
    return unavailable("The article could not be deleted.");
  }
}

function findBySlug(slug: string) {
  return callAuthenticatedBackend<Article>(
    `/articles/slug/${encodeURIComponent(slug)}`,
  );
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "NEWSROOM_UNAVAILABLE", message } },
    { status: 503 },
  );
}
