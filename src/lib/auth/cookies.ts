import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ACCESS_COOKIE = "mikozi_admin_access";
export const REFRESH_COOKIE = "mikozi_admin_refresh";

const baseCookie: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function tokenCookie(expiresAt: string): Partial<ResponseCookie> {
  return {
    ...baseCookie,
    expires: new Date(expiresAt),
  };
}

export const expiredCookie: Partial<ResponseCookie> = {
  ...baseCookie,
  expires: new Date(0),
  maxAge: 0,
};
