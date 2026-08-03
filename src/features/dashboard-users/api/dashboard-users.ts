import type {
  DashboardUser,
  DashboardUserCollection,
  ProvisionDashboardUser,
} from "@/lib/api/contracts";

export async function listDashboardUsers(): Promise<DashboardUserCollection> {
  return request<DashboardUserCollection>(
    "/api/dashboard-users?limit=100&offset=0",
  );
}

export async function provisionDashboardUser(
  input: ProvisionDashboardUser,
): Promise<DashboardUser> {
  return request<DashboardUser>("/api/dashboard-users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateDashboardUserStatus(
  readerId: string,
  status: "active" | "disabled",
): Promise<void> {
  await request(`/api/audience/users/${encodeURIComponent(readerId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function deleteDashboardUser(readerId: string): Promise<void> {
  await request(`/api/audience/users/${encodeURIComponent(readerId)}`, {
    method: "DELETE",
  });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(
      body.error?.message ?? "The request could not be completed.",
    );
  }
  return body;
}
