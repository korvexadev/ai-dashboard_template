import { NextResponse } from "next/server";

import type {
  AudienceUserDetail,
  AudienceUserStatus,
  UpdateAudienceUserStatus,
} from "@/lib/api/contracts";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as UpdateAudienceUserStatus;
    const result = await callAuthenticatedBackend<AudienceUserStatus>(
      `/audience/users/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The account status could not be changed.")
      : sessionRequired();
  } catch {
    return unavailable("The account status could not be changed.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await callAuthenticatedBackend<void>(
      `/audience/users/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (!result) return sessionRequired();
    if (result.status === 204) return new NextResponse(null, { status: 204 });
    return upstreamJson(result, "The account could not be deleted.");
  } catch {
    return unavailable("The account could not be deleted.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "AUDIENCE_UNAVAILABLE", message } },
    { status: 503 },
  );
}
