import { NextResponse } from "next/server";

import type {
  CreateNotificationDraft,
  NotificationDraft,
  NotificationDraftCollection,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams;
    const result = await callAuthenticatedBackend<NotificationDraftCollection>(
      `/notification-drafts?${query.toString()}`,
    );
    return result
      ? upstreamJson(result, "Notification drafts could not be loaded.")
      : sessionRequired();
  } catch {
    return unavailable("Notification drafts could not be loaded.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = (await request.json()) as CreateNotificationDraft;
    const result = await callAuthenticatedBackend<NotificationDraft>(
      "/notification-drafts",
      { method: "POST", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The notification draft could not be saved.")
      : sessionRequired();
  } catch {
    return unavailable("The notification draft could not be saved.");
  }
}

function unavailable(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "NOTIFICATIONS_UNAVAILABLE", message } },
    { status: 503 },
  );
}
