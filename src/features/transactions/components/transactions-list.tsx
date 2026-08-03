"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { listTransactions } from "@/features/transactions/api/transactions";
import type { AdminPaymentTransactionCollection } from "@/lib/api/contracts";

const PAGE_SIZE = 20;

export function TransactionsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [collection, setCollection] =
    useState<AdminPaymentTransactionCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const query = useMemo(() => {
    const next = new URLSearchParams(queryString);
    if (!next.has("limit")) next.set("limit", String(PAGE_SIZE));
    if (!next.has("offset")) next.set("offset", "0");
    if (!next.has("status")) next.set("status", "all");
    if (!next.has("method")) next.set("method", "all");
    return next;
  }, [queryString]);

  useEffect(() => {
    let active = true;
    void listTransactions(query)
      .then((result) => {
        if (!active) return;
        setCollection(result);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Transactions could not be loaded.",
        );
      });
    return () => {
      active = false;
    };
  }, [query, retry]);

  function replaceQuery(change: Record<string, string | undefined>) {
    setError(null);
    setCollection(null);
    const next = new URLSearchParams(queryString);
    for (const [key, value] of Object.entries(change)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`${pathname}?${next.toString()}`);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    replaceQuery({ search: search.trim() || undefined, offset: "0" });
  }

  function refresh() {
    setCollection(null);
    setError(null);
    setRetry((value) => value + 1);
  }

  const offset = Number(query.get("offset") ?? 0);
  const filtersActive = Boolean(
    query.get("search") ||
      query.get("status") !== "all" ||
      query.get("method") !== "all",
  );

  return (
    <main className="article-workspace transactions-page">
      <div className="page-title-row">
        <div>
          <h2>Transactions</h2>
          <p>Payments and refunds.</p>
        </div>
      </div>

      <section className="articles-panel transactions-panel">
        <header className="articles-table-header">
          <div className="articles-library-title">
            <h3>All transactions</h3>
            <p aria-live="polite">
              {collection
                ? `${collection.total} ${collection.total === 1 ? "transaction" : "transactions"}`
                : "Loading…"}
            </p>
          </div>
          <form
            className="article-table-tools transactions-tools"
            onSubmit={submitSearch}
            aria-label="Filter transactions"
          >
            <label className="article-search">
              <span className="sr-only">Search transactions</span>
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reader or reference"
                maxLength={120}
              />
            </label>
            <SearchableSelect
              ariaLabel="Filter by status"
              className="article-status-filter"
              value={query.get("status") ?? "all"}
              options={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending", status: "pending" },
                {
                  value: "succeeded",
                  label: "Succeeded",
                  status: "succeeded",
                },
                { value: "failed", label: "Failed", status: "failed" },
                {
                  value: "refunded",
                  label: "Refunded",
                  status: "refunded",
                },
              ]}
              onChange={(value) => replaceQuery({ status: value, offset: "0" })}
              searchPlaceholder="Search statuses"
            />
            <SearchableSelect
              ariaLabel="Filter by payment method"
              className="article-status-filter"
              value={query.get("method") ?? "all"}
              options={[
                { value: "all", label: "All methods" },
                { value: "mobile_money", label: "Mobile money" },
                { value: "bank_transfer", label: "Bank transfer" },
                { value: "manual", label: "Manual" },
              ]}
              onChange={(value) => replaceQuery({ method: value, offset: "0" })}
              searchPlaceholder="Search methods"
            />
            {filtersActive ? (
              <button
                className="article-clear-filters"
                type="button"
                onClick={() => {
                  setSearch("");
                  router.replace(pathname);
                }}
              >
                Clear
              </button>
            ) : null}
            <button
              className="transaction-refresh"
              type="button"
              onClick={refresh}
            >
              Refresh
            </button>
            <button className="article-search-submit" type="submit">
              <Icon name="search" />
              <span>Search</span>
            </button>
          </form>
        </header>

        {error ? (
          <div className="list-state" role="alert">
            <Icon name="transactions" />
            <h3>Transactions are unavailable.</h3>
            <p>{error}</p>
            <button type="button" onClick={refresh}>
              Try again
            </button>
          </div>
        ) : null}
        {!collection && !error ? (
          <div className="article-skeletons" aria-label="Loading transactions">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {collection?.items.length === 0 ? (
          <div className="list-state">
            <Icon name="transactions" />
            <h3>No transactions found.</h3>
            {filtersActive ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  router.replace(pathname);
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
        {collection?.items.length ? (
          <>
            <div className="articles-table-wrap">
              <table className="articles-table transactions-table">
                <thead>
                  <tr>
                    <th>Reader</th>
                    <th>Plan</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>
                      <span className="sr-only">Open reader</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collection.items.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="transaction-reader-cell">
                        <Link href={`/audience/${transaction.reader.id}`}>
                          <span className="user-initials">
                            {initials(
                              transaction.reader.displayName,
                              transaction.reader.phoneNumber,
                            )}
                          </span>
                          <span>
                            <strong>
                              {transaction.reader.displayName ??
                                "Unnamed reader"}
                            </strong>
                            <small>+{transaction.reader.phoneNumber}</small>
                          </span>
                        </Link>
                      </td>
                      <td data-label="Plan">
                        <strong>{transaction.plan.name}</strong>
                        <small className="table-subcopy">
                          {transaction.type === "refund" ? "Refund" : "Charge"}
                        </small>
                      </td>
                      <td data-label="Method">
                        {formatMethod(transaction.method)}
                      </td>
                      <td data-label="Amount" className="transaction-amount">
                        {formatMoney(
                          transaction.amountMinor,
                          transaction.currency,
                        )}
                      </td>
                      <td data-label="Status">
                        <StatusBadge
                          status={transaction.status}
                          label={sentence(transaction.status)}
                        />
                      </td>
                      <td data-label="Date">
                        <time dateTime={transaction.occurredAt}>
                          {formatDate(transaction.occurredAt)}
                        </time>
                      </td>
                      <td className="article-open-cell">
                        <Link
                          className="row-arrow"
                          href={`/audience/${transaction.reader.id}`}
                          aria-label={`Open ${transaction.reader.displayName ?? transaction.reader.phoneNumber}`}
                        >
                          <Icon name="chevron" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="articles-pagination">
              <p>
                Showing {offset + 1}–
                {Math.min(offset + collection.items.length, collection.total)}{" "}
                of {collection.total}
              </p>
              <div>
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() =>
                    replaceQuery({
                      offset: String(Math.max(0, offset - PAGE_SIZE)),
                    })
                  }
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= collection.total}
                  onClick={() =>
                    replaceQuery({ offset: String(offset + PAGE_SIZE) })
                  }
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </section>
    </main>
  );
}

function initials(name: string | null, phone: string): string {
  if (!name?.trim()) return phone.slice(-2);
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMethod(value: string): string {
  return sentence(value.replace("_", " "));
}

function sentence(value: string): string {
  return value.replace(/^./, (letter) => letter.toUpperCase());
}

function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
