import { NextResponse } from "next/server";

import type { AudienceUserCollection } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.toString();
    const result = await callAuthenticatedBackend<AudienceUserCollection>(
      `/audience/users${query ? `?${query}` : ""}`,
    );
    return result
      ? upstreamJson(result, "The audience could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("The audience could not be loaded.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "AUDIENCE_UNAVAILABLE", message } },
    { status: 503 },
  );
}
