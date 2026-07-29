import type { AuditLogCollection } from "@/lib/api/contracts";

export async function listAuditLogs({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<AuditLogCollection> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`/api/audit-logs?${query.toString()}`, {
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
