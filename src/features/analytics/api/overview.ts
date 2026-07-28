import type { OverviewAnalytics } from "@/lib/api/contracts";

export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
  const response = await fetch("/api/analytics/overview", {
    cache: "no-store",
  });
  const body = (await response.json()) as OverviewAnalytics & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(
      body.error?.message ?? "Overview analytics could not be loaded.",
    );
  }
  return body;
}
