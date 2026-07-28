import { NextResponse } from "next/server";

import type { OverviewAnalytics } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await callAuthenticatedBackend<OverviewAnalytics>(
      "/analytics/overview",
    );
    return result
      ? upstreamJson(result, "Overview analytics could not be loaded.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "ANALYTICS_UNAVAILABLE",
          message: "Overview analytics could not be loaded.",
        },
      },
      { status: 503 },
    );
  }
}
