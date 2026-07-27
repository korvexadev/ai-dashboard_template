import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyOtpSchema } from "@/features/auth/schemas/auth.schema";
import type { ApiEnvelope, VerifiedIdentity } from "@/lib/api/contracts";
import { callBackend, publicUpstreamError } from "@/lib/api/server";
import { setSessionCookies } from "@/lib/auth/session";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = verifyOtpSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_OTP",
          message: "Enter the 6-digit code.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await callBackend<ApiEnvelope<VerifiedIdentity>>(
      "/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(parsed.data),
      },
    );

    if (result.status !== 200) {
      return NextResponse.json(
        publicUpstreamError(
          result.status,
          "That code is invalid or has expired.",
        ),
        { status: result.status },
      );
    }

    const { profile, tokens } = result.body.data;
    if (!profile.adminAccess) {
      await revokeIssuedSession(tokens.accessToken);
      return NextResponse.json(
        {
          error: {
            code: "ADMIN_ACCESS_REQUIRED",
            message:
              "This workspace is only available to Mikozi administrators.",
          },
        },
        { status: 403 },
      );
    }

    setSessionCookies(await cookies(), tokens);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_SERVICE_UNAVAILABLE",
          message: "Sign-in is temporarily unavailable. Please try again.",
        },
      },
      { status: 503 },
    );
  }
}

async function revokeIssuedSession(accessToken: string): Promise<void> {
  try {
    await callBackend("/auth/logout", {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Backend expiry remains the safe fallback if revocation is unavailable.
  }
}
