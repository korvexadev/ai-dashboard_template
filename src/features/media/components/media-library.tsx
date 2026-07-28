"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Icon } from "@/components/icons/icon";
import {
  createMedia,
  listMedia,
  updateMedia,
} from "@/features/media/api/media";
import type { CreateMediaAsset, MediaAsset } from "@/lib/api/contracts";

const initialForm: CreateMediaAsset = {
  title: "",
  altText: "",
  sourceUrl: "",
  mimeType: "image/jpeg",
  fileName: "",
};

export function MediaLibrary() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ready" | "archived" | "">("ready");
  const [form, setForm] = useState<CreateMediaAsset>(initialForm);
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
      const result = await listMedia(query);
      setItems(result.items);
      setTotal(result.total);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The media library could not be loaded.",
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
      await createMedia({
        ...form,
        title: form.title.trim(),
        altText: form.altText.trim(),
        sourceUrl: form.sourceUrl.trim(),
        fileName: form.fileName.trim(),
        caption: form.caption?.trim() || null,
        rightsHolder: form.rightsHolder?.trim() || null,
      });
      setForm(initialForm);
      setShowForm(false);
      await load();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The media asset could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item: MediaAsset) {
    setError(undefined);
    try {
      await updateMedia(item.id, {
        status: item.status === "ready" ? "archived" : "ready",
      });
      await load();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The media asset could not be updated.",
      );
    }
  }

  return (
    <main className="article-workspace library-page">
      <header className="module-page-heading">
        <div>
          <p className="eyebrow">Newsroom assets</p>
          <h2>Media library</h2>
          <p>
            Register approved image sources and retain captions, accessibility,
            dimensions, and rights metadata.
          </p>
        </div>
        <button
          className="solid-button"
          type="button"
          onClick={() => setShowForm((value) => !value)}
        >
          <Icon name={showForm ? "back" : "plus"} />
          {showForm ? "Close form" : "Add media"}
        </button>
      </header>

      <div className="module-notice">
        <Icon name="media" />
        <div>
          <strong>External storage registration</strong>
          <p>
            Mikozi saves the canonical asset URL and editorial metadata. Direct
            object upload will use the future storage adapter.
          </p>
        </div>
      </div>

      {error ? (
        <div className="dashboard-users-error" role="alert">
          <strong>The media request could not be completed.</strong>
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
              <h3>Register image</h3>
              <p>All assets require useful alternative text.</p>
            </div>
          </header>
          <div className="module-form-grid">
            <Field label="Title">
              <input
                required
                maxLength={140}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            <Field label="File name">
              <input
                required
                maxLength={255}
                value={form.fileName}
                onChange={(event) =>
                  setForm({ ...form, fileName: event.target.value })
                }
              />
            </Field>
            <Field label="Source URL" wide>
              <input
                required
                type="url"
                value={form.sourceUrl}
                onChange={(event) =>
                  setForm({ ...form, sourceUrl: event.target.value })
                }
              />
            </Field>
            <Field label="Alternative text" wide>
              <input
                required
                maxLength={300}
                value={form.altText}
                onChange={(event) =>
                  setForm({ ...form, altText: event.target.value })
                }
              />
            </Field>
            <Field label="MIME type">
              <select
                value={form.mimeType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    mimeType: event.target
                      .value as CreateMediaAsset["mimeType"],
                  })
                }
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/gif">GIF</option>
              </select>
            </Field>
            <Field label="Rights holder">
              <input
                maxLength={160}
                value={form.rightsHolder ?? ""}
                onChange={(event) =>
                  setForm({ ...form, rightsHolder: event.target.value })
                }
              />
            </Field>
            <Field label="Width">
              <input
                min={1}
                type="number"
                value={form.width ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    width: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
            </Field>
            <Field label="Height">
              <input
                min={1}
                type="number"
                value={form.height ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    height: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
            </Field>
            <Field label="Caption" wide>
              <textarea
                maxLength={500}
                rows={3}
                value={form.caption ?? ""}
                onChange={(event) =>
                  setForm({ ...form, caption: event.target.value })
                }
              />
            </Field>
          </div>
          <footer>
            <button className="solid-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save to library"}
            </button>
          </footer>
        </form>
      ) : null}

      <section className="library-toolbar">
        <label>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search media"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Media status"
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="">All status</option>
          <option value="ready">Ready</option>
          <option value="archived">Archived</option>
        </select>
        <span>{total} assets</span>
      </section>

      {loading ? (
        <div className="library-grid" aria-label="Loading media">
          {[0, 1, 2].map((item) => (
            <span className="library-card-skeleton" key={item} />
          ))}
        </div>
      ) : items.length ? (
        <div className="library-grid">
          {items.map((item) => (
            <article className="library-card" key={item.id}>
              <div
                className="library-card-image"
                role="img"
                aria-label={item.altText}
                style={{ backgroundImage: `url("${item.sourceUrl}")` }}
              />
              <div className="library-card-copy">
                <div>
                  <span
                    className={`account-status account-status-${item.status}`}
                  >
                    {item.status}
                  </span>
                  <small>{item.mimeType.replace("image/", "")}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.caption ?? item.altText}</p>
                <footer>
                  <span>
                    {item.width && item.height
                      ? `${item.width} × ${item.height}`
                      : "Dimensions not recorded"}
                  </span>
                  <button type="button" onClick={() => void toggleStatus(item)}>
                    {item.status === "ready" ? "Archive" : "Restore"}
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="history-empty">
          <h4>No media assets found</h4>
          <p>Register the first approved image source for the newsroom.</p>
        </div>
      )}
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
