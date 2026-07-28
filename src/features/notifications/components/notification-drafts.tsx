"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Icon } from "@/components/icons/icon";
import { listMedia } from "@/features/media/api/media";
import {
  createNotificationDraft,
  listNotificationDrafts,
  updateNotificationDraft,
} from "@/features/notifications/api/notifications";
import type {
  CreateNotificationDraft,
  MediaAsset,
  NotificationDraft,
} from "@/lib/api/contracts";

const initialForm: CreateNotificationDraft = {
  title: "",
  body: "",
  priority: "normal",
  targetType: "all_readers",
};

export function NotificationDrafts() {
  const [items, setItems] = useState<NotificationDraft[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<CreateNotificationDraft>(initialForm);
  const [targetReaderText, setTargetReaderText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"draft" | "cancelled" | "">("draft");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const query = new URLSearchParams({ limit: "100", offset: "0" });
      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);
      const [drafts, assets] = await Promise.all([
        listNotificationDrafts(query),
        listMedia(
          new URLSearchParams({
            limit: "100",
            offset: "0",
            status: "ready",
          }),
        ),
      ]);
      setItems(drafts.items);
      setMedia(assets.items);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Notification drafts could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const readerIds =
        form.targetType === "specific_readers"
          ? targetReaderText
              .split(/[\s,]+/)
              .map((value) => value.trim())
              .filter(Boolean)
          : undefined;
      await createNotificationDraft({
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        targetReaderIds: readerIds,
        imageAssetId: form.imageAssetId || null,
        actionUrl: form.actionUrl?.trim() || null,
        scheduledAt: form.scheduledAt || null,
      });
      setForm(initialForm);
      setTargetReaderText("");
      setShowForm(false);
      await load();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The notification draft could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item: NotificationDraft) {
    setError(undefined);
    try {
      await updateNotificationDraft(item.id, {
        status: item.status === "draft" ? "cancelled" : "draft",
        priority: item.priority,
      });
      await load();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The notification draft could not be updated.",
      );
    }
  }

  return (
    <main className="article-workspace notification-page">
      <header className="module-page-heading">
        <div>
          <p className="eyebrow">Audience communication</p>
          <h2>Notifications</h2>
          <p>
            Prepare push notification content and targeting before delivery is
            connected.
          </p>
        </div>
        <button
          className="solid-button"
          type="button"
          onClick={() => setShowForm((value) => !value)}
        >
          <Icon name={showForm ? "back" : "plus"} />
          {showForm ? "Close composer" : "New draft"}
        </button>
      </header>

      <div className="module-notice module-notice-warning">
        <Icon name="bell" />
        <div>
          <strong>FCM delivery is not connected</strong>
          <p>
            Saving a draft does not send, schedule, or mark a notification as
            delivered. Delivery will be added through a durable FCM job later.
          </p>
        </div>
      </div>

      {error ? (
        <div className="dashboard-users-error" role="alert">
          <strong>The notification request could not be completed.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {showForm ? (
        <form
          className="module-editor-form"
          onSubmit={(event) => void submit(event)}
        >
          <header>
            <div>
              <h3>Create notification draft</h3>
              <p>Content remains editable and unsent.</p>
            </div>
            <span className="role-pill">Push · Draft</span>
          </header>
          <div className="module-form-grid">
            <Field label="Title" wide>
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            <Field label="Message" wide>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={form.body}
                onChange={(event) =>
                  setForm({ ...form, body: event.target.value })
                }
              />
              <small>{form.body.length}/500 characters</small>
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target
                      .value as CreateNotificationDraft["priority"],
                  })
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>
            <Field label="Audience">
              <select
                value={form.targetType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    targetType: event.target
                      .value as CreateNotificationDraft["targetType"],
                  })
                }
              >
                <option value="all_readers">All readers</option>
                <option value="dashboard_users">Dashboard users</option>
                <option value="specific_readers">Specific readers</option>
              </select>
            </Field>
            {form.targetType === "specific_readers" ? (
              <Field label="Reader IDs" wide>
                <textarea
                  required
                  rows={3}
                  placeholder="Paste UUIDs separated by commas or spaces"
                  value={targetReaderText}
                  onChange={(event) => setTargetReaderText(event.target.value)}
                />
              </Field>
            ) : null}
            <Field label="Image">
              <select
                value={form.imageAssetId ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    imageAssetId: event.target.value || null,
                  })
                }
              >
                <option value="">No image</option>
                {media.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Intended delivery time">
              <input
                type="datetime-local"
                value={
                  form.scheduledAt ? toLocalDateTime(form.scheduledAt) : ""
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    scheduledAt: event.target.value
                      ? new Date(event.target.value).toISOString()
                      : null,
                  })
                }
              />
            </Field>
            <Field label="Action URL" wide>
              <input
                placeholder="/articles/article-slug"
                maxLength={500}
                value={form.actionUrl ?? ""}
                onChange={(event) =>
                  setForm({ ...form, actionUrl: event.target.value })
                }
              />
            </Field>
          </div>
          <footer>
            <button className="solid-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save draft"}
            </button>
          </footer>
        </form>
      ) : null}

      <section className="library-toolbar">
        <label>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search notification drafts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Notification status"
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span>{items.length} shown</span>
      </section>

      <section className="notification-list">
        {loading ? (
          <div className="history-loading" aria-label="Loading notifications">
            <span />
            <span />
            <span />
          </div>
        ) : items.length ? (
          items.map((item) => (
            <article key={item.id}>
              {item.imageAsset ? (
                <div
                  className="notification-image"
                  role="img"
                  aria-label={item.imageAsset.title}
                  style={{
                    backgroundImage: `url("${item.imageAsset.sourceUrl}")`,
                  }}
                />
              ) : (
                <span className="notification-icon">
                  <Icon name="bell" />
                </span>
              )}
              <div className="notification-copy">
                <div>
                  <span className={`priority-pill priority-${item.priority}`}>
                    {item.priority}
                  </span>
                  <span className="account-status">{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>
                  {formatTarget(item.targetType)} ·{" "}
                  {item.scheduledAt
                    ? `Intended for ${formatDate(item.scheduledAt)}`
                    : `Saved ${formatDate(item.createdAt)}`}
                </small>
              </div>
              <div className="notification-actions">
                <span>Not sent</span>
                <button type="button" onClick={() => void toggleStatus(item)}>
                  {item.status === "draft" ? "Cancel draft" : "Restore draft"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="history-empty">
            <h4>No notification drafts found</h4>
            <p>Create a draft now and connect delivery through FCM later.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? "wide" : undefined}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatTarget(target: NotificationDraft["targetType"]): string {
  if (target === "all_readers") return "All readers";
  if (target === "dashboard_users") return "Dashboard users";
  return "Specific readers";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
