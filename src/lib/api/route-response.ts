import "server-only";

import { NextResponse } from "next/server";

import type { ApiEnvelope } from "@/lib/api/contracts";
import type { UpstreamResponse } from "@/lib/api/server";

export function sessionRequired(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "SESSION_EXPIRED",
        message: "Your session has ended. Sign in again.",
      },
    },
    { status: 401 },
  );
}

export function upstreamJson<T>(
  result: UpstreamResponse<ApiEnvelope<T>>,
  fallback: string,
): NextResponse {
  if (result.status >= 200 && result.status < 300) {
    return NextResponse.json(result.body.data, { status: result.status });
  }

  const upstream = result.body as unknown as {
    error?: { code?: string; message?: string };
    code?: string;
    message?: string;
  };
  return NextResponse.json(
    {
      error: {
        code: upstream.error?.code ?? upstream.code ?? "REQUEST_FAILED",
        message: upstream.error?.message ?? upstream.message ?? fallback,
      },
    },
    { status: result.status },
  );
}
