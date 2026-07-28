import { NextResponse } from "next/server";

import type {
  AssignReaderSubscription,
  ReaderEntitlement,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as AssignReaderSubscription;
    const result = await callAuthenticatedBackend<ReaderEntitlement>(
      `/audience/users/${encodeURIComponent(id)}/subscription`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The subscription could not be assigned.")
      : sessionRequired();
  } catch {
    return unavailable("The subscription could not be assigned.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "SUBSCRIPTIONS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
