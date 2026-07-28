import type {
  CreateSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionPlanCollection,
  UpdateSubscriptionPlan,
} from "@/lib/api/contracts";

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const result = await request<SubscriptionPlanCollection>(
    "/api/subscription-plans",
  );
  return result.items;
}

export function createSubscriptionPlan(
  input: CreateSubscriptionPlan,
): Promise<SubscriptionPlan> {
  return request<SubscriptionPlan>("/api/subscription-plans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateSubscriptionPlan(
  id: string,
  input: UpdateSubscriptionPlan,
): Promise<SubscriptionPlan> {
  return request<SubscriptionPlan>(
    `/api/subscription-plans/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
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
