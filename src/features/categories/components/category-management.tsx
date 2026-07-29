"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import {
  getCategories,
  updateCategory,
} from "@/features/categories/api/categories";
import type { ArticleCategory } from "@/lib/api/contracts";

import { CategoryCreateDialog } from "./category-create-dialog";

export function CategoryManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = toStatus(searchParams.get("status"));
  const [searchDraft, setSearchDraft] = useState(search);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void getCategories({ search: search || undefined, status })
      .then(setCategories)
      .catch((loadError: unknown) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Categories could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }, [search, status]);

  function setFilters(next: { search?: string; status?: string }) {
    const query = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    router.replace(`/categories${query.size ? `?${query.toString()}` : ""}`);
  }

  async function changeStatus(category: ArticleCategory) {
    setUpdatingId(category.id);
    setError("");
    setNotice("");
    try {
      const nextStatus: ArticleCategory["status"] =
        category.status === "active" ? "archived" : "active";
      await updateCategory(category.id, {
        status: nextStatus,
        sortOrder: category.sortOrder,
      });
      setCategories((current) =>
        current
          .map((item) =>
            item.id === category.id ? { ...item, status: nextStatus } : item,
          )
          .filter((item) => !status || item.status === status),
      );
      setNotice(
        `${category.name} was ${nextStatus === "active" ? "restored" : "archived"}.`,
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "The category could not be updated.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main className="category-workspace">
      <header className="page-title-row">
        <div>
          <h2>Categories</h2>
          <p>
            Organize articles and control the category catalog used by mobile
            navigation.
          </p>
        </div>
        <button
          className="solid-button"
          type="button"
          onClick={() => setCreating(true)}
        >
          <Icon name="plus" /> New category
        </button>
      </header>

      <section className="category-panel">
        <form
          className="category-filters"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ search: searchDraft.trim() });
          }}
        >
          <label>
            <span>Search categories</span>
            <div>
              <Icon name="search" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Name or slug"
              />
            </div>
          </label>
          <label>
            <span>Status</span>
            <select
              value={status ?? ""}
              onChange={(event) => setFilters({ status: event.target.value })}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <button className="outline-button" type="submit">
            Search
          </button>
        </form>

        {error ? <p className="form-error category-feedback">{error}</p> : null}
        {notice ? (
          <p className="success-notice category-feedback">{notice}</p>
        ) : null}

        {loading ? (
          <div className="module-loading">Loading categories…</div>
        ) : categories.length ? (
          <div className="category-table-wrap">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Articles</th>
                  <th>Order</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      <small>/{category.slug}</small>
                    </td>
                    <td>
                      <span className={`status-chip ${category.status}`}>
                        {category.status}
                      </span>
                    </td>
                    <td>{category.articleCount}</td>
                    <td>{category.sortOrder + 1}</td>
                    <td>
                      <button
                        className={
                          category.status === "active"
                            ? "text-button danger-text"
                            : "text-button"
                        }
                        type="button"
                        onClick={() => void changeStatus(category)}
                        disabled={updatingId === category.id}
                      >
                        {updatingId === category.id
                          ? "Updating…"
                          : category.status === "active"
                            ? "Archive"
                            : "Restore"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="homepage-empty">
            <strong>No categories found</strong>
            <p>Adjust the filters or create a category.</p>
          </div>
        )}
      </section>

      <CategoryCreateDialog
        open={creating}
        sortOrder={categories.length}
        onClose={() => setCreating(false)}
        onCreated={(category) => {
          if (!status || status === "active") {
            setCategories((current) => [...current, category]);
          }
          setNotice(`${category.name} was created.`);
        }}
      />
    </main>
  );
}

function toStatus(value: string | null): "active" | "archived" | undefined {
  return value === "active" || value === "archived" ? value : undefined;
}
