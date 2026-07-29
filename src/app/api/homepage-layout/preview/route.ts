import { NextResponse } from "next/server";

import type { HomepageSnapshot } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(): Promise<NextResponse> {
  const result =
    await callAuthenticatedBackend<HomepageSnapshot>("/reader/homepage");
  return result
    ? upstreamJson(result, "The mobile homepage preview could not be loaded.")
    : sessionRequired();
}
