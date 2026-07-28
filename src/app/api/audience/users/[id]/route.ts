import { NextResponse } from "next/server";

import type { AudienceUserDetail } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await callAuthenticatedBackend<AudienceUserDetail>(
      `/audience/users/${encodeURIComponent(id)}`,
    );
    return result
      ? upstreamJson(result, "The audience user could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("The audience user could not be loaded.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "AUDIENCE_UNAVAILABLE", message } },
    { status: 503 },
  );
}
