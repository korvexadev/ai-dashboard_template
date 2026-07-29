"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  deleteAudienceUser,
  getAudienceHistory,
  assignAudienceSubscription,
  getAudienceUser,
  updateAudienceUserStatus,
  type AudienceHistoryCategory,
  type AudienceHistoryCollection,
} from "@/features/audience/api/audience";
import { listSubscriptionPlans } from "@/features/subscriptions/api/subscriptions";
import type {
  AudienceUserDetail,
  CommentActivityCollection,
  LikeActivityCollection,
  SubscriptionActivityCollection,
  SubscriptionPlan,
  TransactionActivityCollection,
} from "@/lib/api/contracts";
import { canModerateAudienceUser } from "@/features/audience/policies/audience-actions";

export function AudienceDetail({
  id,
  canManage,
  currentReaderId,
}: {
  id: string;
  canManage: boolean;
  currentReaderId: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AudienceUserDetail>();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [accountAction, setAccountAction] = useState<
    "status" | "delete" | undefined
  >();
  const [confirmAction, setConfirmAction] = useState<
    "disable" | "delete" | undefined
  >();
  const [historyCategory, setHistoryCategory] =
    useState<AudienceHistoryCategory>("comments");
  const [history, setHistory] = useState<AudienceHistoryCollection>();
  const [historyError, setHistoryError] = useState<string>();
  const [historyLoading, setHistoryLoading] = useState(true);
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

  useEffect(() => {
    let active = true;
    void getAudienceHistory(id, historyCategory)
      .then((result) => {
        if (active) setHistory(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setHistoryError(
            caught instanceof Error
              ? caught.message
              : "The user history could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [historyCategory, id]);

  useEffect(() => {
    if (!confirmAction) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmAction(undefined);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmAction]);

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

  async function changeAccountStatus() {
    if (!user) return;
    const status = user.status === "active" ? "disabled" : "active";
    setConfirmAction(undefined);
    setAccountAction("status");
    setError(undefined);
    try {
      const result = await updateAudienceUserStatus(user.id, status);
      setUser({
        ...user,
        status: result.status,
        activeSessions: status === "disabled" ? 0 : user.activeSessions,
      });
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The account status could not be changed.",
      );
    } finally {
      setAccountAction(undefined);
    }
  }

  async function removeAccount() {
    if (!user) return;
    setConfirmAction(undefined);
    setAccountAction("delete");
    setError(undefined);
    try {
      await deleteAudienceUser(user.id);
      router.push("/audience");
      router.refresh();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The account could not be deleted.",
      );
      setAccountAction(undefined);
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
  const isSelf = user.id === currentReaderId;
  const canModerate = canModerateAudienceUser(
    canManage,
    currentReaderId,
    user.id,
  );

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
          <div className="audience-profile-labels">
            <span className="access-label">{formatAccess(user.adminRole)}</span>
            <StatusBadge status={user.status} />
          </div>
          <h2>{user.displayName ?? "Unnamed user"}</h2>
          <p>+{user.phoneNumber}</p>
        </div>
        {canModerate ? (
          <div className="account-actions">
            <button
              type="button"
              disabled={Boolean(accountAction)}
              onClick={() =>
                user.status === "active"
                  ? setConfirmAction("disable")
                  : void changeAccountStatus()
              }
            >
              {accountAction === "status"
                ? "Updating..."
                : user.status === "active"
                  ? "Disable account"
                  : "Reactivate account"}
            </button>
            <button
              className="danger-action"
              type="button"
              disabled={Boolean(accountAction)}
              onClick={() => setConfirmAction("delete")}
            >
              {accountAction === "delete" ? "Deleting..." : "Delete account"}
            </button>
          </div>
        ) : isSelf ? (
          <p className="self-protection-note">
            Your account is protected from destructive self-actions.
          </p>
        ) : null}
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
                <SearchableSelect
                  ariaLabel="Assign plan"
                  value={selectedPlanId}
                  options={plans
                    .filter((plan) => plan.status === "active")
                    .map((plan) => ({
                      value: plan.id,
                      label: plan.name,
                      status: plan.status,
                    }))}
                  onChange={setSelectedPlanId}
                  searchPlaceholder="Search plans"
                />
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
            </div>
          ) : (
            <p className="assignment-readonly">
              Only a super administrator can change this subscription.
            </p>
          )}
        </aside>
      </section>

      <section className="audience-history-section">
        <header>
          <h3>History</h3>
          {history ? (
            <span className="history-total">
              {history.total} {history.total === 1 ? "record" : "records"}
            </span>
          ) : null}
        </header>
        <div className="history-tabs" role="tablist" aria-label="User history">
          {(
            [
              ["comments", "Comments"],
              ["likes", "Likes"],
              ["subscriptions", "Subscriptions"],
              ["transactions", "Transactions"],
            ] as const
          ).map(([category, label]) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={historyCategory === category}
              onClick={() => {
                if (historyCategory === category) return;
                setHistory(undefined);
                setHistoryLoading(true);
                setHistoryError(undefined);
                setHistoryCategory(category);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="history-content" role="tabpanel">
          {historyLoading ? (
            <div className="history-loading" aria-label="Loading user history">
              <span />
              <span />
              <span />
            </div>
          ) : historyError ? (
            <div className="history-empty" role="alert">
              <h4>History unavailable</h4>
              <p>{historyError}</p>
            </div>
          ) : (
            renderHistory(historyCategory, history)
          )}
        </div>
      </section>
      {confirmAction ? (
        <div className="reader-confirm-overlay">
          <section
            className="reader-confirm-dialog audience-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audience-confirm-heading"
          >
            <span className="reader-confirm-icon">
              <Icon name={confirmAction === "delete" ? "trash" : "users"} />
            </span>
            <h2 id="audience-confirm-heading">
              {confirmAction === "delete"
                ? "Delete account?"
                : "Disable account?"}
            </h2>
            <p>{user.displayName ?? `+${user.phoneNumber}`}</p>
            <small>
              {confirmAction === "delete"
                ? "Access ends immediately. Historical activity is retained."
                : "Every active session will be signed out."}
            </small>
            <div>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmAction(undefined)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                type="button"
                onClick={() =>
                  confirmAction === "delete"
                    ? void removeAccount()
                    : void changeAccountStatus()
                }
              >
                {confirmAction === "delete" ? "Delete" : "Disable"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function renderHistory(
  category: AudienceHistoryCategory,
  history: AudienceHistoryCollection | undefined,
) {
  if (!history?.items.length) {
    const labels: Record<AudienceHistoryCategory, [string, string]> = {
      comments: [
        "No comments recorded",
        "Comments posted from the mobile experience will appear here.",
      ],
      likes: [
        "No likes recorded",
        "Articles this user likes will appear here.",
      ],
      subscriptions: [
        "No assigned subscriptions",
        "The user currently relies on the default free plan.",
      ],
      transactions: [
        "No transactions recorded",
        "Subscription charges and refunds will appear here when payments are enabled.",
      ],
    };
    return (
      <div className="history-empty">
        <h4>{labels[category][0]}</h4>
        <p>{labels[category][1]}</p>
      </div>
    );
  }

  if (category === "comments") {
    const items = (history as CommentActivityCollection).items;
    return (
      <ul className="history-list">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <Link href={`/articles/${item.article.slug}`}>
                {item.article.title}
              </Link>
              <p>{item.body}</p>
            </div>
            <HistoryMeta status={item.status} date={item.createdAt} />
          </li>
        ))}
      </ul>
    );
  }

  if (category === "likes") {
    const items = (history as LikeActivityCollection).items;
    return (
      <ul className="history-list">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <Link href={`/articles/${item.article.slug}`}>
                {item.article.title}
              </Link>
              <p>Article liked</p>
            </div>
            <HistoryMeta date={item.createdAt} />
          </li>
        ))}
      </ul>
    );
  }

  if (category === "subscriptions") {
    const items = (history as SubscriptionActivityCollection).items;
    return (
      <ul className="history-list">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.plan.name}</strong>
              <p>Assigned by {item.assignedBy.displayName ?? "Mikozi admin"}</p>
            </div>
            <HistoryMeta status={item.status} date={item.assignedAt} />
          </li>
        ))}
      </ul>
    );
  }

  const items = (history as TransactionActivityCollection).items;
  return (
    <ul className="history-list">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>
              {item.type === "refund" ? "Refund" : "Subscription charge"} ·{" "}
              {item.plan.name}
            </strong>
            <p>{formatMoney(item.amountMinor, item.currency)}</p>
          </div>
          <HistoryMeta status={item.status} date={item.occurredAt} />
        </li>
      ))}
    </ul>
  );
}

function HistoryMeta({ status, date }: { status?: string; date: string }) {
  return (
    <div className="history-meta">
      {status ? <span>{status}</span> : null}
      <time dateTime={date}>{formatDateTime(date)}</time>
    </div>
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

function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}
