import { NextResponse } from "next/server";

import type { AdminPaymentTransactionCollection } from "@/lib/api/contracts";
import { callAuthenticatedBackend } from "@/lib/api/authenticated";
import { sessionRequired, upstreamJson } from "@/lib/api/route-response";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.toString();
    const result =
      await callAuthenticatedBackend<AdminPaymentTransactionCollection>(
        `/subscription-transactions${query ? `?${query}` : ""}`,
      );
    return result
      ? upstreamJson(result, "Transactions could not be loaded.")
      : sessionRequired();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "TRANSACTIONS_UNAVAILABLE",
          message: "Transactions could not be loaded.",
        },
      },
      { status: 503 },
    );
  }
}
