import type { AdminPaymentTransactionCollection } from "@/lib/api/contracts";

export async function listTransactions(
  params: URLSearchParams,
): Promise<AdminPaymentTransactionCollection> {
  const response = await fetch(
    `/api/subscription-transactions?${params.toString()}`,
    { cache: "no-store" },
  );
  const body = (await response.json()) as AdminPaymentTransactionCollection & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "Transactions could not be loaded.");
  }
  return body;
}
