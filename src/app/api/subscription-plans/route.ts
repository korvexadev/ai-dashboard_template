import { NextResponse } from "next/server";

import type {
  CreateSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionPlanCollection,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await callAuthenticatedBackend<SubscriptionPlanCollection>(
      "/subscription-plans",
    );
    return result
      ? upstreamJson(result, "Subscription plans could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("Subscription plans could not be loaded.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as CreateSubscriptionPlan;
    const result = await callAuthenticatedBackend<SubscriptionPlan>(
      "/subscription-plans",
      { method: "POST", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The subscription plan could not be created.")
      : sessionRequired();
  } catch {
    return unavailable("The subscription plan could not be created.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "SUBSCRIPTIONS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
