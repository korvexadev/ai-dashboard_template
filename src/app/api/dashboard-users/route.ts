import { NextResponse } from "next/server";

import type {
  DashboardUser,
  DashboardUserCollection,
  ProvisionDashboardUser,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.toString();
    const result = await callAuthenticatedBackend<DashboardUserCollection>(
      `/dashboard-users${query ? `?${query}` : ""}`,
    );
    return result
      ? upstreamJson(result, "Dashboard users could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("Dashboard users could not be loaded.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as ProvisionDashboardUser;
    const result = await callAuthenticatedBackend<DashboardUser>(
      "/dashboard-users",
      { method: "POST", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The dashboard user could not be added.")
      : sessionRequired();
  } catch {
    return unavailable("The dashboard user could not be added.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "DASHBOARD_USERS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
