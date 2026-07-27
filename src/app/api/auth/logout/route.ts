import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { callBackend } from "@/lib/api/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { clearSessionCookies, refreshSessionTokens } from "@/lib/auth/session";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  try {
    if (accessToken) {
      const logoutResult = await revoke(accessToken);
      if (logoutResult !== 401) {
        return NextResponse.json({ loggedOut: true });
      }
    }

    if (refreshToken) {
      const refreshResult = await refreshSessionTokens(refreshToken);
      if (refreshResult.status === 200) {
        await revoke(refreshResult.body.data.accessToken);
      }
    }
  } catch {
    // Local logout is authoritative for this browser even if the backend is down.
  } finally {
    clearSessionCookies(cookieStore);
  }

  return NextResponse.json({ loggedOut: true });
}

async function revoke(accessToken: string): Promise<number> {
  const result = await callBackend("/auth/logout", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
  });
  return result.status;
}
