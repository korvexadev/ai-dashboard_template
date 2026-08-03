import { NextResponse } from "next/server";

import type {
  ReaderAccessPolicy,
  UpdateReaderAccessPolicy,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(): Promise<NextResponse> {
  return forward("GET", undefined, "Free access settings could not be loaded.");
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as UpdateReaderAccessPolicy;
    return forward(
      "PATCH",
      JSON.stringify(input),
      "Free access settings could not be saved.",
    );
  } catch {
    return unavailable("Free access settings could not be saved.");
  }
}

async function forward(
  method: "GET" | "PATCH",
  body: string | undefined,
  fallback: string,
): Promise<NextResponse> {
  try {
    const result = await callAuthenticatedBackend<ReaderAccessPolicy>(
      "/subscription-access-policy",
      { method, ...(body ? { body } : {}) },
    );
    return result ? upstreamJson(result, fallback) : sessionRequired();
  } catch {
    return unavailable(fallback);
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "SUBSCRIPTIONS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
