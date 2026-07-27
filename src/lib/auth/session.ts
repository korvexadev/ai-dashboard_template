import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

import type { ApiEnvelope, Profile, Tokens } from "@/lib/api/contracts";
import { callBackend, type UpstreamResponse } from "@/lib/api/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  expiredCookie,
  tokenCookie,
} from "./cookies";
import { shouldClearSession } from "./session-status";

type RefreshResponse = UpstreamResponse<ApiEnvelope<Tokens>>;

const REFRESH_COALESCE_MS = 5_000;
const refreshFlights = new Map<string, Promise<RefreshResponse>>();

interface SessionResult {
  profile: Profile | null;
  reason?: "missing" | "expired" | "forbidden" | "unavailable";
}

export async function readSessionProfile(): Promise<SessionResult> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return { profile: null, reason: "missing" };
  }

  try {
    if (accessToken) {
      const profileResult = await fetchProfile(accessToken);
      if (profileResult.status === 200) {
        return adminResult(profileResult.body.data, cookieStore);
      }
      if (profileResult.status !== 401) {
        if (shouldClearSession(profileResult.status)) {
          clearSessionCookies(cookieStore);
          return { profile: null, reason: "expired" };
        }
        return { profile: null, reason: "unavailable" };
      }
    }

    if (!refreshToken) {
      clearSessionCookies(cookieStore);
      return { profile: null, reason: "expired" };
    }

    const refreshResult = await refreshSessionTokens(refreshToken);

    if (refreshResult.status !== 200) {
      if (shouldClearSession(refreshResult.status)) {
        clearSessionCookies(cookieStore);
        return { profile: null, reason: "expired" };
      }
      return { profile: null, reason: "unavailable" };
    }

    const tokens = refreshResult.body.data;
    setSessionCookies(cookieStore, tokens);
    accessToken = tokens.accessToken;

    const profileResult = await fetchProfile(accessToken);
    if (profileResult.status !== 200) {
      if (shouldClearSession(profileResult.status)) {
        clearSessionCookies(cookieStore);
        return { profile: null, reason: "expired" };
      }
      return { profile: null, reason: "unavailable" };
    }

    return adminResult(profileResult.body.data, cookieStore);
  } catch {
    return { profile: null, reason: "unavailable" };
  }
}

export function refreshSessionTokens(
  refreshToken: string,
): Promise<RefreshResponse> {
  const key = createHash("sha256").update(refreshToken).digest("hex");
  const inFlight = refreshFlights.get(key);
  if (inFlight) return inFlight;

  const request = callBackend<ApiEnvelope<Tokens>>("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  refreshFlights.set(key, request);

  void request
    .finally(() => {
      const timer = setTimeout(() => {
        if (refreshFlights.get(key) === request) refreshFlights.delete(key);
      }, REFRESH_COALESCE_MS);
      timer.unref();
    })
    .catch(() => undefined);

  return request;
}

export function setSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  tokens: Tokens,
): void {
  cookieStore.set(
    ACCESS_COOKIE,
    tokens.accessToken,
    tokenCookie(tokens.accessExpiresAt),
  );
  cookieStore.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    tokenCookie(tokens.refreshExpiresAt),
  );
}

export function clearSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): void {
  cookieStore.set(ACCESS_COOKIE, "", expiredCookie);
  cookieStore.set(REFRESH_COOKIE, "", expiredCookie);
}

async function fetchProfile(
  accessToken: string,
): Promise<{ body: ApiEnvelope<Profile>; status: number }> {
  return callBackend<ApiEnvelope<Profile>>("/auth/me", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

function adminResult(
  profile: Profile,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): SessionResult {
  if (!profile.adminAccess) {
    clearSessionCookies(cookieStore);
    return { profile: null, reason: "forbidden" };
  }

  return { profile };
}
