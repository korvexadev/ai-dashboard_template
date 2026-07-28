import type { AuditLogCollection } from "@/lib/api/contracts";

export async function listAuditLogs(): Promise<AuditLogCollection> {
  const response = await fetch("/api/audit-logs?limit=50&offset=0", {
    cache: "no-store",
  });
  const body = (await response.json()) as AuditLogCollection & {
    error?: { message: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "Activity could not be loaded.");
  }
  return body;
}
