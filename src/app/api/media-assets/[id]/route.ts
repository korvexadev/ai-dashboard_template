import { NextResponse } from "next/server";

import type { MediaAsset, UpdateMediaAsset } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as UpdateMediaAsset;
    const result = await callAuthenticatedBackend<MediaAsset>(
      `/media-assets/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The media asset could not be updated.")
      : sessionRequired();
  } catch {
    return unavailable();
  }
}

function unavailable(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "MEDIA_UNAVAILABLE",
        message: "The media asset could not be updated.",
      },
    },
    { status: 503 },
  );
}
