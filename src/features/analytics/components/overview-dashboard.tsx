"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/icons/icon";
import { getOverviewAnalytics } from "@/features/analytics/api/overview";
import type { OverviewAnalytics } from "@/lib/api/contracts";

export function OverviewDashboard() {
  const [analytics, setAnalytics] = useState<OverviewAnalytics>();
  const [error, setError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(undefined);
    try {
      setAnalytics(await getOverviewAnalytics());
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Overview analytics could not be loaded.",
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getOverviewAnalytics()
      .then((result) => {
        if (active) setAnalytics(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Overview analytics could not be loaded.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="overview analytics-overview">
      <div className="overview-heading analytics-heading">
        <div>
          <p className="eyebrow">Live workspace data</p>
          <h2>Overview</h2>
          <p>
            Publishing, audience, access, and operational signals from Mikozi.
          </p>
        </div>
        <button
          className="outline-button analytics-refresh"
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
        >
          <Icon name="activity" />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <section className="analytics-error" role="alert">
          <div>
            <strong>Analytics are temporarily unavailable.</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={() => void load()}>
            Try again
          </button>
        </section>
      ) : null}

      <section className="analytics-metrics" aria-label="System totals">
        <Metric
          label="Total articles"
          value={analytics?.articles.total}
          note={`${formatNumber(analytics?.articles.createdLast7Days)} added this week`}
          icon="articles"
        />
        <Metric
          label="Published"
          value={analytics?.articles.published}
          note={`${formatNumber(analytics?.articles.publishedLast7Days)} published this week`}
          icon="checkCircle"
        />
        <Metric
          label="Audience"
          value={analytics?.identity.totalReaders}
          note={`${formatNumber(analytics?.identity.readersJoinedLast7Days)} new readers this week`}
          icon="users"
        />
        <Metric
          label="Dashboard users"
          value={analytics?.identity.activeDashboardUsers}
          note="Active privileged accounts"
          icon="settings"
        />
        <Metric
          label="Active sessions"
          value={analytics?.identity.activeSessions}
          note="Currently valid sessions"
          icon="activity"
        />
        <Metric
          label="Activity"
          value={analytics?.operations.activityLast24Hours}
          note="Recorded actions in 24 hours"
          icon="clock"
        />
        <Metric
          label="Paid subscribers"
          value={analytics?.subscriptions.paidSubscribers}
          note={`${formatNumber(analytics?.subscriptions.activePlans)} active plans`}
          icon="bell"
        />
        <Metric
          label="Reads today"
          value={analytics?.subscriptions.articleReadsToday}
          note={`${formatNumber(analytics?.subscriptions.freeReaders)} readers on Free`}
          icon="articles"
        />
      </section>

      <section className="analytics-detail-grid">
        <article className="analytics-panel publishing-panel">
          <header>
            <div>
              <p className="eyebrow">Editorial pipeline</p>
              <h3>Article status</h3>
            </div>
            <Link href="/articles">
              View articles <Icon name="arrowRight" />
            </Link>
          </header>
          <div className="pipeline-list">
            <PipelineRow
              label="Published"
              value={analytics?.articles.published}
              total={analytics?.articles.total}
              tone="published"
            />
            <PipelineRow
              label="Draft"
              value={analytics?.articles.draft}
              total={analytics?.articles.total}
              tone="draft"
            />
            <PipelineRow
              label="Archived"
              value={analytics?.articles.archived}
              total={analytics?.articles.total}
              tone="archived"
            />
          </div>
        </article>

        <article className="analytics-panel pulse-panel">
          <header>
            <div>
              <p className="eyebrow">Last 7 days</p>
              <h3>Workspace pulse</h3>
            </div>
          </header>
          <div className="pulse-list">
            <PulseRow
              label="Articles created"
              value={analytics?.articles.createdLast7Days}
            />
            <PulseRow
              label="Articles published"
              value={analytics?.articles.publishedLast7Days}
            />
            <PulseRow
              label="Readers joined"
              value={analytics?.identity.readersJoinedLast7Days}
            />
            <PulseRow
              label="Article revisions"
              value={analytics?.operations.totalArticleRevisions}
              detail="all time"
            />
            <PulseRow
              label="Paid subscribers"
              value={analytics?.subscriptions.paidSubscribers}
              detail="currently active"
            />
            <PulseRow
              label="Comments"
              value={analytics?.engagement.comments}
              detail="persisted"
            />
            <PulseRow
              label="Likes"
              value={analytics?.engagement.likes}
              detail="persisted"
            />
            <PulseRow
              label="Transactions"
              value={analytics?.subscriptions.transactionsRecorded}
              detail="persisted records"
            />
            <PulseRow
              label="Disabled readers"
              value={analytics?.identity.disabledReaders}
              detail="currently disabled"
            />
            <PulseRow
              label="Media assets"
              value={analytics?.contentOperations.readyMediaAssets}
              detail="ready for use"
            />
            <PulseRow
              label="Notification drafts"
              value={analytics?.contentOperations.notificationDrafts}
              detail="saved, not sent"
            />
          </div>
        </article>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value?: number;
  note: string;
  icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <article className="analytics-metric">
      <span className="metric-icon">
        <Icon name={icon} />
      </span>
      <p>{label}</p>
      <strong>{value === undefined ? "—" : formatNumber(value)}</strong>
      <small>{value === undefined ? "Loading live data…" : note}</small>
    </article>
  );
}

function PipelineRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value?: number;
  total?: number;
  tone: string;
}) {
  const percentage =
    value === undefined || !total ? 0 : Math.round((value / total) * 100);

  return (
    <div className="pipeline-row">
      <div>
        <span>{label}</span>
        <strong>{value === undefined ? "—" : formatNumber(value)}</strong>
      </div>
      <div className="pipeline-track" aria-hidden="true">
        <span
          className={tone}
          style={{ width: `${Math.max(percentage, value ? 3 : 0)}%` }}
        />
      </div>
      <small>{value === undefined ? "Loading" : `${percentage}%`}</small>
    </div>
  );
}

function PulseRow({
  label,
  value,
  detail = "this week",
}: {
  label: string;
  value?: number;
  detail?: string;
}) {
  return (
    <div>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <b>{value === undefined ? "—" : formatNumber(value)}</b>
    </div>
  );
}

function formatNumber(value?: number): string {
  return value === undefined
    ? "—"
    : new Intl.NumberFormat("en-MW").format(value);
}
