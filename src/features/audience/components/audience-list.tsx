"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { listAudience } from "@/features/audience/api/audience";
import { listSubscriptionPlans } from "@/features/subscriptions/api/subscriptions";
import type {
  AudienceUserCollection,
  SubscriptionPlan,
} from "@/lib/api/contracts";

const PAGE_SIZE = 20;
type SortField = "displayName" | "createdAt" | "lastActiveAt";

export function AudienceList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [collection, setCollection] = useState<AudienceUserCollection | null>(
    null,
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const query = useMemo(() => {
    const next = new URLSearchParams(queryString);
    if (!next.has("limit")) next.set("limit", String(PAGE_SIZE));
    if (!next.has("offset")) next.set("offset", "0");
    if (!next.has("access")) next.set("access", "all");
    if (!next.has("status")) next.set("status", "all");
    if (!next.has("sortBy")) next.set("sortBy", "createdAt");
    if (!next.has("sortDirection")) next.set("sortDirection", "desc");
    return next;
  }, [queryString]);

  useEffect(() => {
    let active = true;
    void Promise.all([listAudience(query), listSubscriptionPlans()])
      .then(([audience, availablePlans]) => {
        if (!active) return;
        setCollection(audience);
        setPlans(availablePlans);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The audience could not be loaded.",
          );
        }
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

  function sort(field: SortField) {
    const currentField = query.get("sortBy");
    const currentDirection = query.get("sortDirection");
    replaceQuery({
      sortBy: field,
      sortDirection:
        currentField === field && currentDirection === "asc" ? "desc" : "asc",
      offset: "0",
    });
  }

  const offset = Number(query.get("offset") ?? 0);
  const sortBy = query.get("sortBy") ?? "createdAt";
  const sortDirection = query.get("sortDirection") === "asc" ? "asc" : "desc";

  return (
    <main className="article-workspace audience-page">
      <div className="page-title-row">
        <div>
          <h2>Audience</h2>
          <p>Readers, access and subscriptions.</p>
        </div>
      </div>

      <section className="articles-panel audience-panel">
        <header className="articles-table-header">
          <div className="articles-library-title">
            <h3>All readers</h3>
            <p>
              {collection
                ? `${collection.total} ${collection.total === 1 ? "user" : "users"}`
                : "Loading…"}
            </p>
          </div>
          <form
            className="article-table-tools audience-tools"
            onSubmit={submitSearch}
          >
            <label className="article-search">
              <span className="sr-only">Search audience</span>
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or phone"
                maxLength={120}
              />
            </label>
            <SearchableSelect
              ariaLabel="Filter by access"
              className="article-status-filter"
              value={query.get("access") ?? "all"}
              options={[
                { value: "all", label: "All access" },
                { value: "reader", label: "Mobile readers" },
                { value: "admin", label: "Administrators" },
              ]}
              onChange={(value) => replaceQuery({ access: value, offset: "0" })}
              searchPlaceholder="Search access"
            />
            <SearchableSelect
              ariaLabel="Filter by account status"
              className="article-status-filter"
              value={query.get("status") ?? "all"}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active", status: "active" },
                {
                  value: "disabled",
                  label: "Disabled",
                  status: "disabled",
                },
              ]}
              onChange={(value) => replaceQuery({ status: value, offset: "0" })}
              searchPlaceholder="Search statuses"
            />
            <SearchableSelect
              ariaLabel="Filter by subscription"
              className="article-status-filter"
              value={query.get("planId") ?? ""}
              options={[
                { value: "", label: "All plans" },
                ...plans.map((plan) => ({
                  value: plan.id,
                  label: plan.name,
                  status: plan.status,
                })),
              ]}
              onChange={(value) =>
                replaceQuery({
                  planId: value || undefined,
                  offset: "0",
                })
              }
              searchPlaceholder="Search plans"
            />
            <button
              className="article-search-submit"
              type="submit"
              aria-label="Search audience"
            >
              <Icon name="search" />
              <span>Search</span>
            </button>
          </form>
        </header>

        {error ? (
          <div className="list-state" role="alert">
            <Icon name="users" />
            <h3>The audience is unavailable.</h3>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setRetry((value) => value + 1);
              }}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!collection && !error ? (
          <div className="article-skeletons" aria-label="Loading audience">
            <span />
            <span />
            <span />
          </div>
        ) : null}

        {collection?.items.length === 0 ? (
          <div className="list-state">
            <Icon name="users" />
            <h3>No readers found</h3>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.replace(pathname);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {collection?.items.length ? (
          <>
            <div className="articles-table-wrap">
              <table className="articles-table audience-table">
                <thead>
                  <tr>
                    <SortableHeading
                      label="User"
                      field="displayName"
                      activeField={sortBy}
                      direction={sortDirection}
                      onSort={sort}
                    />
                    <th>Status</th>
                    <th>Access</th>
                    <th>Subscription</th>
                    <th>Today</th>
                    <SortableHeading
                      label="Last active"
                      field="lastActiveAt"
                      activeField={sortBy}
                      direction={sortDirection}
                      onSort={sort}
                    />
                    <SortableHeading
                      label="Joined"
                      field="createdAt"
                      activeField={sortBy}
                      direction={sortDirection}
                      onSort={sort}
                    />
                    <th>
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collection.items.map((user) => (
                    <tr key={user.id}>
                      <td className="audience-title-cell">
                        <Link
                          className="audience-user-cell"
                          href={`/audience/${user.id}`}
                        >
                          <span className="user-initials">
                            {initials(user.displayName, user.phoneNumber)}
                          </span>
                          <span>
                            <strong>
                              {user.displayName ?? "Unnamed user"}
                            </strong>
                            <small>+{user.phoneNumber}</small>
                          </span>
                        </Link>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={user.status} />
                      </td>
                      <td data-label="Access">
                        <span className="access-label">
                          {formatAccess(user.adminRole)}
                        </span>
                      </td>
                      <td data-label="Subscription">
                        <strong>{user.entitlement.plan.name}</strong>
                        <small className="table-subcopy">
                          {formatPlanLimit(user.entitlement)}
                        </small>
                      </td>
                      <td data-label="Today">
                        {user.entitlement.administratorBypass
                          ? "Unlimited"
                          : `${user.entitlement.articlesReadToday} read`}
                      </td>
                      <td data-label="Last active">
                        {formatRelative(user.lastActiveAt)}
                      </td>
                      <td data-label="Joined">{formatDate(user.createdAt)}</td>
                      <td className="audience-open-cell">
                        <Link
                          className="row-arrow"
                          href={`/audience/${user.id}`}
                          aria-label={`Open ${user.displayName ?? user.phoneNumber}`}
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
                Showing {offset + 1}-
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

function SortableHeading({
  label,
  field,
  activeField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: string;
  direction: "asc" | "desc";
  onSort: (field: SortField) => void;
}) {
  const active = activeField === field;
  return (
    <th
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button type="button" onClick={() => onSort(field)}>
        {label}
        <Icon name={active && direction === "asc" ? "arrowUp" : "arrowDown"} />
      </button>
    </th>
  );
}

function initials(name: string | null, phone: string): string {
  if (!name) return phone.slice(-2);
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatAccess(role: "admin" | "super_admin" | null): string {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  return "Mobile reader";
}

function formatPlanLimit(
  entitlement: AudienceUserCollection["items"][number]["entitlement"],
): string {
  if (entitlement.administratorBypass) return "Admin bypass";
  if (entitlement.plan.dailyArticleLimit === null) return "Unlimited articles";
  return `${entitlement.plan.dailyArticleLimit} articles daily`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelative(value: string | null): string {
  if (!value) return "Never";
  const elapsed = Date.now() - new Date(value).getTime();
  const days = Math.floor(elapsed / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}
