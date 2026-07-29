"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { listAuditLogs } from "@/features/audit/api/audit";
import type { AuditLogCollection } from "@/lib/api/contracts";

const PAGE_SIZE = 20;

export function AuditLogList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const offset = toOffset(searchParams.get("offset"));
  const [logs, setLogs] = useState<AuditLogCollection>();
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void listAuditLogs({ limit: PAGE_SIZE, offset })
      .then((result) => {
        if (active) setLogs(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Activity could not load.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [offset, retry]);

  function changePage(nextOffset: number) {
    setLogs(undefined);
    setError(undefined);
    const query = new URLSearchParams(searchParams.toString());
    if (nextOffset > 0) query.set("offset", String(nextOffset));
    else query.delete("offset");
    router.replace(`${pathname}${query.size ? `?${query.toString()}` : ""}`);
  }

  return (
    <main className="article-workspace">
      <div className="page-title-row">
        <div>
          <h2>Activity log</h2>
          <p>Administrative actions.</p>
        </div>
      </div>
      <section className="articles-panel audit-panel">
        <header className="articles-table-header">
          <div className="articles-library-title">
            <h3>Recent activity</h3>
            <p>
              {logs ? `${logs.total} recorded actions` : "Loading activity…"}
            </p>
          </div>
        </header>
        {error ? (
          <div className="list-state" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setLogs(undefined);
                setError(undefined);
                setRetry((value) => value + 1);
              }}
            >
              Try again
            </button>
          </div>
        ) : null}
        {!logs && !error ? (
          <div className="article-skeletons" aria-label="Loading activity">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {logs?.total === 0 ? (
          <div className="list-state">
            <Icon name="activity" />
            <h3>No activity has been recorded.</h3>
          </div>
        ) : null}
        {logs?.items.map((log) => (
          <article className="audit-row" key={log.id}>
            <span className="audit-icon">
              <Icon name="articles" />
            </span>
            <div>
              <strong>{sentence(log.action)}</strong>
              <p>
                {log.actor.displayName ?? log.actor.phoneNumber}
                <span aria-hidden="true">/</span>
                {log.resourceType} {shortId(log.resourceId)}
              </p>
            </div>
            <time dateTime={log.createdAt}>
              {formatTimestamp(log.createdAt)}
            </time>
          </article>
        ))}
        {logs && (logs.total > PAGE_SIZE || offset > 0) ? (
          <footer className="articles-pagination audit-pagination">
            <p>
              {logs.items.length
                ? `Showing ${offset + 1}–${Math.min(
                    offset + logs.items.length,
                    logs.total,
                  )} of ${logs.total}`
                : `0 of ${logs.total}`}
            </p>
            <div>
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => changePage(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + PAGE_SIZE >= logs.total}
                onClick={() => changePage(offset + PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          </footer>
        ) : null}
      </section>
    </main>
  );
}

function toOffset(value: string | null): number {
  const offset = Number(value);
  return Number.isInteger(offset) && offset > 0 ? offset : 0;
}

function sentence(action: string): string {
  return action
    .replaceAll(".", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function shortId(id: string): string {
  return `#${id.slice(0, 8)}`;
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
