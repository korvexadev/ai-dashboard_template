import { NextResponse } from "next/server";

import type {
  CommentActivityCollection,
  LikeActivityCollection,
  SubscriptionActivityCollection,
  TransactionActivityCollection,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

type HistoryCollection =
  | CommentActivityCollection
  | LikeActivityCollection
  | SubscriptionActivityCollection
  | TransactionActivityCollection;

const categories = new Set([
  "comments",
  "likes",
  "subscriptions",
  "transactions",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; category: string }> },
): Promise<NextResponse> {
  try {
    const { id, category } = await params;
    if (!categories.has(category)) {
      return NextResponse.json(
        {
          error: {
            code: "HISTORY_CATEGORY_INVALID",
            message: "The requested history category is not available.",
          },
        },
        { status: 404 },
      );
    }
    const query = new URL(request.url).searchParams;
    const result = await callAuthenticatedBackend<HistoryCollection>(
      `/audience/users/${encodeURIComponent(id)}/${category}?${query.toString()}`,
    );
    return result
      ? upstreamJson(result, "The user history could not be loaded.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "AUDIENCE_HISTORY_UNAVAILABLE",
          message: "The user history could not be loaded.",
        },
      },
      { status: 503 },
    );
  }
}
