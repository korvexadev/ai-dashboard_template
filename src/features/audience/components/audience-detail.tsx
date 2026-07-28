"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import {
  assignAudienceSubscription,
  getAudienceUser,
} from "@/features/audience/api/audience";
import { listSubscriptionPlans } from "@/features/subscriptions/api/subscriptions";
import type { AudienceUserDetail, SubscriptionPlan } from "@/lib/api/contracts";

export function AudienceDetail({
  id,
  canManage,
}: {
  id: string;
  canManage: boolean;
}) {
  const [user, setUser] = useState<AudienceUserDetail>();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([getAudienceUser(id), listSubscriptionPlans()])
      .then(([reader, availablePlans]) => {
        if (!active) return;
        setUser(reader);
        setPlans(availablePlans);
        setSelectedPlanId(reader.entitlement.plan.id);
        setError(undefined);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The audience user could not be loaded.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  async function assign() {
    if (!user || !selectedPlanId) return;
    setSaving(true);
    setError(undefined);
    try {
      const entitlement = await assignAudienceSubscription(
        user.id,
        selectedPlanId,
      );
      setUser({ ...user, entitlement });
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The subscription could not be assigned.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!user && !error) {
    return (
      <main className="article-workspace audience-detail-page">
        <div className="article-skeletons" aria-label="Loading audience user">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="article-workspace audience-detail-page">
        <div className="list-state" role="alert">
          <Icon name="users" />
          <h2>The audience user is unavailable.</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  const entitlement = user.entitlement;
  const limit = entitlement.plan.dailyArticleLimit;
  const remaining = entitlement.articlesRemainingToday;

  return (
    <main className="article-workspace audience-detail-page">
      <nav className="detail-path" aria-label="Breadcrumb">
        <Link href="/audience">Audience</Link>
        <Icon name="chevron" />
        <span>{user.displayName ?? user.phoneNumber}</span>
      </nav>

      <section className="audience-profile-head">
        <span className="audience-profile-avatar">
          {initials(user.displayName, user.phoneNumber)}
        </span>
        <div>
          <span className="access-label">{formatAccess(user.adminRole)}</span>
          <h2>{user.displayName ?? "Unnamed user"}</h2>
          <p>+{user.phoneNumber}</p>
        </div>
      </section>

      {error ? (
        <div className="dashboard-users-error" role="alert">
          <strong>The requested change could not be completed.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <section className="audience-detail-grid">
        <div className="audience-detail-main">
          <article className="audience-detail-section">
            <header>
              <h3>Account details</h3>
              <p>Identity and operational access information.</p>
            </header>
            <dl className="audience-facts">
              <Fact label="Phone" value={`+${user.phoneNumber}`} />
              <Fact
                label="Phone verified"
                value={formatDateTime(user.phoneVerifiedAt)}
              />
              <Fact
                label="Preferred language"
                value={user.preferredLanguage.toUpperCase()}
              />
              <Fact label="Joined" value={formatDateTime(user.createdAt)} />
              <Fact
                label="Last active"
                value={
                  user.lastActiveAt
                    ? formatDateTime(user.lastActiveAt)
                    : "No recorded activity"
                }
              />
              <Fact
                label="Active sessions"
                value={String(user.activeSessions)}
              />
            </dl>
          </article>

          <article className="audience-detail-section">
            <header>
              <h3>Profile</h3>
              <p>Reader-managed information currently stored by Mikozi.</p>
            </header>
            <div className="audience-bio">
              {user.bio ? <p>{user.bio}</p> : <p>No biography provided.</p>}
            </div>
          </article>
        </div>

        <aside className="entitlement-card">
          <div className="entitlement-heading">
            <span className="metric-icon">
              <Icon name="articles" />
            </span>
            <div>
              <small>Effective subscription</small>
              <h3>{entitlement.plan.name}</h3>
            </div>
            <span className="role-pill">
              {entitlement.source === "free" ? "Default" : "Assigned"}
            </span>
          </div>

          <div className="allowance-number">
            <strong>
              {entitlement.administratorBypass || limit === null
                ? "Unlimited"
                : remaining}
            </strong>
            <span>
              {entitlement.administratorBypass
                ? "Administrator access is not limited"
                : limit === null
                  ? "No daily article limit"
                  : `${remaining === 1 ? "article" : "articles"} remaining today`}
            </span>
          </div>

          {!entitlement.administratorBypass && limit !== null ? (
            <dl className="allowance-breakdown">
              <div>
                <dt>Daily allowance</dt>
                <dd>{limit}</dd>
              </div>
              <div>
                <dt>Read today</dt>
                <dd>{entitlement.articlesReadToday}</dd>
              </div>
              <div>
                <dt>Resets</dt>
                <dd>{formatReset(entitlement.resetsAt)}</dd>
              </div>
            </dl>
          ) : null}

          {canManage ? (
            <div className="assignment-control">
              <label>
                Assign plan
                <select
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                >
                  {plans
                    .filter((plan) => plan.status === "active")
                    .map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="solid-button"
                type="button"
                disabled={
                  saving ||
                  !selectedPlanId ||
                  selectedPlanId === entitlement.plan.id
                }
                onClick={() => void assign()}
              >
                {saving ? "Saving..." : "Save subscription"}
              </button>
              <p>
                Assigning Free removes the current paid assignment. The change
                takes effect immediately.
              </p>
            </div>
          ) : (
            <p className="assignment-readonly">
              Only a super administrator can change this subscription.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatReset(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}
