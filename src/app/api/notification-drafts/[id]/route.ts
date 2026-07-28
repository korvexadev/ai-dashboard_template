import { NextResponse } from "next/server";

import type {
  NotificationDraft,
  UpdateNotificationDraft,
} from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const input = (await request.json()) as UpdateNotificationDraft;
    const result = await callAuthenticatedBackend<NotificationDraft>(
      `/notification-drafts/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return result
      ? upstreamJson(result, "The notification draft could not be updated.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "NOTIFICATIONS_UNAVAILABLE",
          message: "The notification draft could not be updated.",
        },
      },
      { status: 503 },
    );
  }
}
