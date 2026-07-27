"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Profile } from "@/lib/api/contracts";

interface SessionGuardProps {
  children: ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();
  const reconciliationStarted = useRef(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (reconciliationStarted.current) return;
    reconciliationStarted.current = true;

    async function reconcileSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        if (response.status === 401 || response.status === 403) {
          router.replace("/auth");
          return;
        }
        if (!response.ok) {
          setUnavailable(true);
          return;
        }

        const body = (await response.json()) as { profile: Profile };
        setProfile(body.profile);
      } catch {
        setUnavailable(true);
      }
    }

    void reconcileSession();
  }, [router]);

  if (unavailable) {
    return (
      <main className="session-state">
        <BrandMark />
        <h1>The newsroom is temporarily unavailable.</h1>
        <p>Your session is safe. Reconnect and try once more.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="session-state" aria-live="polite">
        <span className="session-loader" aria-hidden="true" />
        <p>Opening your newsroom…</p>
      </main>
    );
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
