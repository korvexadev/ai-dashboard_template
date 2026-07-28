import { NextResponse } from "next/server";

import type {
  CreateMediaAsset,
  MediaAsset,
  MediaAssetCollection,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams;
    const result = await callAuthenticatedBackend<MediaAssetCollection>(
      `/media-assets?${query.toString()}`,
    );
    return result
      ? upstreamJson(result, "The media library could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("The media library could not be loaded.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as CreateMediaAsset;
    const result = await callAuthenticatedBackend<MediaAsset>("/media-assets", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result
      ? upstreamJson(result, "The media asset could not be saved.")
      : sessionRequired();
  } catch {
    return unavailable("The media asset could not be saved.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "MEDIA_UNAVAILABLE", message } },
    { status: 503 },
  );
}
