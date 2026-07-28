"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/icons/icon";
import {
  ArticleApiError,
  listArticles,
} from "@/features/articles/api/articles";
import type { ArticleCollection } from "@/lib/api/contracts";

const PAGE_SIZE = 20;
type SortField = "title" | "status" | "createdAt" | "updatedAt";

export function ArticlesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [collection, setCollection] = useState<ArticleCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const query = useMemo(() => {
    const next = new URLSearchParams(queryString);
    if (!next.has("limit")) next.set("limit", String(PAGE_SIZE));
    if (!next.has("offset")) next.set("offset", "0");
    if (!next.has("sortBy")) next.set("sortBy", "updatedAt");
    if (!next.has("sortDirection")) next.set("sortDirection", "desc");
    return next;
  }, [queryString]);

  useEffect(() => {
    let active = true;
    void listArticles(query)
      .then((result) => {
        if (active) setCollection(result);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        if (caught instanceof ArticleApiError && caught.status === 401) {
          window.location.assign("/auth");
          return;
        }
        setError(
          caught instanceof Error ? caught.message : "Articles could not load.",
        );
      });
    return () => {
      active = false;
    };
  }, [query, retry]);

  function replaceQuery(change: Record<string, string | undefined>) {
    setError(null);
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
  const sortBy = query.get("sortBy") ?? "updatedAt";
  const sortDirection = query.get("sortDirection") === "asc" ? "asc" : "desc";

  return (
    <main className="article-workspace">
      <div className="page-title-row">
        <div>
          <h2>Articles</h2>
          <p>Find, review, update, publish, archive, and remove articles.</p>
        </div>
        <Link className="solid-button" href="/articles/new">
          <Icon name="plus" /> New article
        </Link>
      </div>

      <section className="articles-panel">
        <header className="articles-table-header">
          <div>
            <h3>All articles</h3>
            <p>
              {collection
                ? `${collection.total} ${collection.total === 1 ? "article" : "articles"}`
                : "Loading newsroom…"}
            </p>
          </div>
          <form className="article-table-tools" onSubmit={submitSearch}>
            <label className="article-search">
              <span className="sr-only">Search articles</span>
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, summary, or slug"
                maxLength={120}
              />
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={query.get("status") ?? ""}
                onChange={(event) =>
                  replaceQuery({
                    status: event.target.value || undefined,
                    offset: "0",
                  })
                }
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button type="submit">Search</button>
          </form>
        </header>

        {error ? (
          <div className="list-state" role="alert">
            <Icon name="articles" />
            <h3>The articles desk is unavailable.</h3>
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
          <div className="article-skeletons" aria-label="Loading articles">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {collection?.items.length === 0 ? (
          <div className="list-state">
            <Icon name="articles" />
            <h3>No articles match this view.</h3>
            <p>Change the search or status filter, or create a new article.</p>
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
              <table className="articles-table">
                <thead>
                  <tr>
                    <SortableHeading
                      label="Article"
                      field="title"
                      activeField={sortBy}
                      direction={sortDirection}
                      onSort={sort}
                    />
                    <SortableHeading
                      label="Status"
                      field="status"
                      activeField={sortBy}
                      direction={sortDirection}
                      onSort={sort}
                    />
                    <th>Sections</th>
                    <th>Author</th>
                    <SortableHeading
                      label="Updated"
                      field="updatedAt"
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
                  {collection.items.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <Link href={`/articles/${article.slug}`}>
                          <strong>{article.title}</strong>
                          <span>{article.summary}</span>
                          <small>{article.slug}</small>
                        </Link>
                      </td>
                      <td>
                        <span className="status-chip">{article.status}</span>
                      </td>
                      <td>{article.sectionCount}</td>
                      <td>{article.author.displayName ?? "Mikozi admin"}</td>
                      <td>{formatDate(article.updatedAt)}</td>
                      <td>
                        <Link
                          className="row-arrow"
                          href={`/articles/${article.slug}`}
                          aria-label={`Open ${article.title}`}
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
        <span aria-hidden="true">
          {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
