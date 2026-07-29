"use client";

import { useEffect, useRef, useState } from "react";

import { createCategory } from "@/features/categories/api/categories";
import type { ArticleCategory } from "@/lib/api/contracts";

interface CategoryCreateDialogProps {
  open: boolean;
  sortOrder: number;
  onClose: () => void;
  onCreated: (category: ArticleCategory) => void;
}

export function CategoryCreateDialog({
  open,
  sortOrder,
  onClose,
  onCreated,
}: CategoryCreateDialogProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => nameInput.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  if (!open) return null;

  function close() {
    if (saving) return;
    setName("");
    setDescription("");
    setError("");
    onClose();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const category = await createCategory({
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        sortOrder,
      });
      onCreated(category);
      setName("");
      setDescription("");
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The category could not be created.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="category-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
      >
        <header>
          <div>
            <h2 id="category-dialog-title">New category</h2>
            <p>Create it here, then continue without leaving your work.</p>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Close new category dialog"
          >
            Close
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            <span>Name</span>
            <input
              ref={nameInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoComplete="off"
            />
          </label>
          <label>
            <span>
              Description <small>Optional</small>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={300}
              rows={3}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <footer>
            <button
              className="outline-button"
              type="button"
              onClick={close}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="solid-button" type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create category"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
