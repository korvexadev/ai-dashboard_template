import { NextResponse } from "next/server";

import type {
  SubscriptionPlan,
  UpdateSubscriptionPlan,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as UpdateSubscriptionPlan;
    const result = await callAuthenticatedBackend<SubscriptionPlan>(
      `/subscription-plans/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The subscription plan could not be updated.")
      : sessionRequired();
  } catch {
    return unavailable("The subscription plan could not be updated.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "SUBSCRIPTIONS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
