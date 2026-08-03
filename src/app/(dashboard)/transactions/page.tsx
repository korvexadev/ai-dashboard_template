import { Suspense } from "react";

import { TransactionsList } from "@/features/transactions/components/transactions-list";

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="article-skeletons" aria-label="Loading transactions" />
      }
    >
      <TransactionsList />
    </Suspense>
  );
}
