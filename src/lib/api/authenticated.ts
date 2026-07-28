import "server-only";

import { cookies } from "next/headers";

import type { ApiEnvelope } from "@/lib/api/contracts";
import { callBackend, type UpstreamResponse } from "@/lib/api/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import {
  clearSessionCookies,
  refreshSessionTokens,
  setSessionCookies,
} from "@/lib/auth/session";
import { shouldClearSession } from "@/lib/auth/session-status";

export async function callAuthenticatedBackend<T>(
  path: string,
  init: RequestInit = {},
): Promise<UpstreamResponse<ApiEnvelope<T>> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) return null;

  if (accessToken) {
    const result = await callWithAccess<T>(path, accessToken, init);
    if (result.status !== 401) return result;
  }

  if (!refreshToken) {
    clearSessionCookies(cookieStore);
    return null;
  }

  const refresh = await refreshSessionTokens(refreshToken);
  if (refresh.status !== 200) {
    if (shouldClearSession(refresh.status)) {
      clearSessionCookies(cookieStore);
      return null;
    }
    return refresh as unknown as UpstreamResponse<ApiEnvelope<T>>;
  }

  setSessionCookies(cookieStore, refresh.body.data);
  return callWithAccess<T>(path, refresh.body.data.accessToken, init);
}

function callWithAccess<T>(
  path: string,
  accessToken: string,
  init: RequestInit,
): Promise<UpstreamResponse<ApiEnvelope<T>>> {
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${accessToken}`);
  return callBackend<ApiEnvelope<T>>(path, { ...init, headers });
}
