import { NextResponse } from "next/server";

import { readSessionProfile } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const session = await readSessionProfile();

  if (!session.profile) {
    const status = session.reason === "unavailable" ? 503 : 401;
    return NextResponse.json(
      {
        error: {
          code:
            session.reason === "unavailable"
              ? "AUTH_SERVICE_UNAVAILABLE"
              : "SESSION_EXPIRED",
          message:
            status === 503
              ? "The session service is temporarily unavailable."
              : "Your session has ended. Sign in again.",
        },
      },
      { status },
    );
  }

  return NextResponse.json({ profile: session.profile });
}
