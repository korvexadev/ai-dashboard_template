"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { listAuditLogs } from "@/features/audit/api/audit";
import type { AuditLogCollection } from "@/lib/api/contracts";

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditLogCollection>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    void listAuditLogs()
      .then(setLogs)
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error ? caught.message : "Activity could not load.",
        );
      });
  }, []);

  return (
    <main className="article-workspace">
      <div className="page-title-row">
        <div>
          <h2>Activity log</h2>
          <p>A timestamped record of administrative newsroom actions.</p>
        </div>
      </div>
      <section className="articles-panel audit-panel">
        <header>
          <div>
            <h3>Recent activity</h3>
            <p>
              {logs ? `${logs.total} recorded actions` : "Loading activity…"}
            </p>
          </div>
        </header>
        {error ? (
          <div className="list-state" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {logs?.items.length === 0 ? (
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
      </section>
    </main>
  );
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
