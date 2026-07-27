import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { SessionGuard } from "@/features/auth/components/session-guard";
import { REFRESH_COOKIE } from "@/lib/auth/cookies";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.has(REFRESH_COOKIE)) redirect("/auth");

  return <SessionGuard>{children}</SessionGuard>;
}
