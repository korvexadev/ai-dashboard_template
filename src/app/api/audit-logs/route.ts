import { NextResponse } from "next/server";

import type { AuditLogCollection } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.toString();
    const result = await callAuthenticatedBackend<AuditLogCollection>(
      `/audit-logs${query ? `?${query}` : ""}`,
    );
    return result
      ? upstreamJson(result, "Activity could not be loaded.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "AUDIT_UNAVAILABLE",
          message: "Activity could not be loaded.",
        },
      },
      { status: 503 },
    );
  }
}
