"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Icon, type IconName } from "@/components/icons/icon";
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
          <h2>Overview</h2>
          <p>Live newsroom activity at a glance.</p>
        </div>
        <button
          className={`analytics-refresh ${refreshing ? "is-refreshing" : ""}`}
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          aria-label={refreshing ? "Refreshing overview" : "Refresh overview"}
          title={refreshing ? "Refreshing overview" : "Refresh overview"}
        >
          <Icon name="activity" />
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

      <section className="analytics-metrics" aria-label="Newsroom totals">
        <Metric
          label="Total articles"
          value={analytics?.articles.total}
          note={`${formatNumber(analytics?.articles.createdLast7Days)} added this week`}
          icon="articles"
          featured
        />
        <Metric
          label="Published"
          value={analytics?.articles.published}
          note={`${formatNumber(analytics?.articles.publishedLast7Days)} this week`}
          icon="checkCircle"
        />
        <Metric
          label="Audience"
          value={analytics?.identity.totalReaders}
          note={`${formatNumber(analytics?.identity.readersJoinedLast7Days)} joined this week`}
          icon="users"
        />
        <Metric
          label="Paid subscribers"
          value={analytics?.subscriptions.paidSubscribers}
          note={`${formatNumber(analytics?.subscriptions.activePlans)} active plans`}
          icon="bell"
        />
      </section>

      <section className="analytics-workspace" aria-label="Newsroom analytics">
        <article className="analytics-panel publishing-panel">
          <header>
            <h3>Article status</h3>
            <Link href="/articles">
              View articles <Icon name="arrowRight" />
            </Link>
          </header>
          <div
            className="status-chart"
            role="img"
            aria-label={articleStatusLabel(analytics)}
          >
            <StatusColumn
              label="Published"
              value={analytics?.articles.published}
              total={analytics?.articles.total}
              tone="published"
            />
            <StatusColumn
              label="Draft"
              value={analytics?.articles.draft}
              total={analytics?.articles.total}
              tone="draft"
            />
            <StatusColumn
              label="Archived"
              value={analytics?.articles.archived}
              total={analytics?.articles.total}
              tone="archived"
            />
          </div>
        </article>

        <article className="analytics-panel pulse-panel">
          <header>
            <h3>Last 7 days</h3>
            <span className="live-pulse" aria-label="Live data" />
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
          </div>
          <footer>
            <span>Updated live</span>
            <i aria-hidden="true" />
          </footer>
        </article>

        <article className="analytics-panel activity-panel">
          <header>
            <h3>Workspace activity</h3>
            <span>
              {formatNumber(analytics?.operations.activityLast24Hours)}
            </span>
          </header>
          <div className="activity-list">
            <ActivityRow
              label="Active sessions"
              detail="Valid now"
              value={analytics?.identity.activeSessions}
              icon="activity"
            />
            <ActivityRow
              label="Dashboard users"
              detail="Active accounts"
              value={analytics?.identity.activeDashboardUsers}
              icon="users"
            />
            <ActivityRow
              label="Media assets"
              detail="Ready for use"
              value={analytics?.contentOperations.readyMediaAssets}
              icon="media"
            />
            <ActivityRow
              label="Notification drafts"
              detail="Saved drafts"
              value={analytics?.contentOperations.notificationDrafts}
              icon="bell"
            />
            <ActivityRow
              label="Homepage sections"
              detail={`Layout v${analytics?.contentOperations.homepageLayoutVersion ?? "—"}`}
              value={analytics?.contentOperations.homepageSections}
              icon="dashboard"
            />
          </div>
        </article>

        <article className="analytics-panel reader-panel">
          <header>
            <h3>Reader activity</h3>
          </header>
          <div>
            <InlineStat
              label="Reads today"
              value={analytics?.subscriptions.articleReadsToday}
            />
            <InlineStat
              label="Free readers"
              value={analytics?.subscriptions.freeReaders}
            />
            <InlineStat
              label="Comments"
              value={analytics?.engagement.comments}
            />
            <InlineStat label="Likes" value={analytics?.engagement.likes} />
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
  featured = false,
}: {
  label: string;
  value?: number;
  note: string;
  icon: IconName;
  featured?: boolean;
}) {
  return (
    <article
      className={`analytics-metric ${featured ? "is-featured" : ""} ${
        value === undefined ? "is-loading" : ""
      }`}
    >
      <span className="metric-icon">
        <Icon name={icon} />
      </span>
      <p>{label}</p>
      <strong>{value === undefined ? "—" : formatNumber(value)}</strong>
      <small>{value === undefined ? "Loading live data" : note}</small>
    </article>
  );
}

function StatusColumn({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value?: number;
  total?: number;
  tone: "published" | "draft" | "archived";
}) {
  const percentage =
    value === undefined || !total ? 0 : Math.round((value / total) * 100);
  const height = Math.max(percentage, value ? 12 : 4);

  return (
    <div className="status-column">
      <strong>{formatNumber(value)}</strong>
      <div className="status-column-track" aria-hidden="true">
        <span className={tone} style={{ height: `${height}%` }} />
      </div>
      <span>{label}</span>
      <small>{value === undefined ? "Loading" : `${percentage}%`}</small>
    </div>
  );
}

function PulseRow({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <span>
        <small>{label}</small>
        <strong>{formatNumber(value)}</strong>
      </span>
      <svg
        viewBox="0 0 92 28"
        role="presentation"
        focusable="false"
        aria-hidden="true"
      >
        <path d="M1 21c12 0 13-13 25-13s13 12 25 12S65 9 76 12s9 1 15 0" />
      </svg>
    </div>
  );
}

function ActivityRow({
  label,
  detail,
  value,
  icon,
}: {
  label: string;
  detail: string;
  value?: number;
  icon: IconName;
}) {
  return (
    <div>
      <span className="activity-icon">
        <Icon name={icon} />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <b>{formatNumber(value)}</b>
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <strong>{formatNumber(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function articleStatusLabel(analytics?: OverviewAnalytics): string {
  if (!analytics) return "Article status is loading.";

  return [
    `${formatNumber(analytics.articles.published)} published`,
    `${formatNumber(analytics.articles.draft)} draft`,
    `${formatNumber(analytics.articles.archived)} archived`,
  ].join(", ");
}

function formatNumber(value?: number): string {
  return value === undefined
    ? "—"
    : new Intl.NumberFormat("en-MW").format(value);
}
