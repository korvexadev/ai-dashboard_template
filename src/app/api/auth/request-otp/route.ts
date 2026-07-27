import { NextResponse } from "next/server";

import { requestOtpSchema } from "@/features/auth/schemas/auth.schema";
import type { ApiEnvelope, OtpChallenge } from "@/lib/api/contracts";
import { callBackend, publicUpstreamError } from "@/lib/api/server";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = requestOtpSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PHONE_NUMBER",
          message: "Enter a valid Malawi phone number.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await callBackend<ApiEnvelope<OtpChallenge>>(
      "/auth/request-otp",
      {
        method: "POST",
        body: JSON.stringify(parsed.data),
      },
    );

    if (result.status !== 201) {
      return NextResponse.json(
        publicUpstreamError(result.status, "We could not send that code."),
        { status: result.status },
      );
    }

    return NextResponse.json(result.body.data, { status: 201 });
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
