import { NextResponse } from "next/server";

import type {
  AdminHomepageLayout,
  SaveHomepageLayout,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(): Promise<NextResponse> {
  const result =
    await callAuthenticatedBackend<AdminHomepageLayout>("/homepage-layout");
  return result
    ? upstreamJson(result, "The homepage layout could not be loaded.")
    : sessionRequired();
}

export async function PUT(request: Request): Promise<NextResponse> {
  const input = (await request.json()) as SaveHomepageLayout;
  const result = await callAuthenticatedBackend<AdminHomepageLayout>(
    "/homepage-layout",
    { method: "PUT", body: JSON.stringify(input) },
  );
  return result
    ? upstreamJson(result, "The homepage layout could not be saved.")
    : sessionRequired();
}
