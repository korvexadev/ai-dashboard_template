"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArticleApiError,
  deleteArticle,
  getArticle,
  updateArticleStatus,
} from "@/features/articles/api/articles";
import type { Article } from "@/lib/api/contracts";

import { ArticleSectionView } from "./article-section-view";

export function ArticleReader({ slug }: { slug: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean }>();
  const [actionError, setActionError] = useState<string>();
  const [workingAction, setWorkingAction] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    void getArticle(slug)
      .then(setArticle)
      .catch((caught: unknown) => {
        if (caught instanceof ArticleApiError && caught.status === 401) {
          window.location.assign("/auth");
          return;
        }
        setError({
          message:
            caught instanceof Error
              ? caught.message
              : "The article could not be loaded.",
          notFound: caught instanceof ArticleApiError && caught.status === 404,
        });
      });
  }, [slug]);

  useEffect(() => {
    if (!confirmingDelete) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmingDelete(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmingDelete]);

  if (error) {
    return (
      <main className="article-workspace">
        <div className="reader-state">
          <Icon name="articles" />
          <h2>
            {error.notFound ? "Article not found" : "Article unavailable"}
          </h2>
          <p>{error.message}</p>
          <Link href="/articles">Return to articles</Link>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="article-workspace">
        <div className="reader-loading" aria-label="Loading article">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }
  const currentArticle = article;

  async function changeStatus(status: Article["status"]) {
    setActionError(undefined);
    setWorkingAction(status);
    try {
      setArticle(
        await updateArticleStatus(currentArticle.slug, {
          status,
          expectedVersion: currentArticle.version,
        }),
      );
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : "The article status could not be changed.",
      );
    } finally {
      setWorkingAction(undefined);
    }
  }

  async function remove() {
    setConfirmingDelete(false);
    setActionError(undefined);
    setWorkingAction("delete");
    try {
      await deleteArticle(currentArticle.slug, currentArticle.version);
      router.push("/articles");
      router.refresh();
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : "The article could not be deleted.",
      );
      setWorkingAction(undefined);
    }
  }

  return (
    <main className="article-workspace article-reader">
      <div className="reader-toolbar">
        <nav className="article-breadcrumb" aria-label="Article path">
          <Link href="/articles">
            <Icon name="back" /> Articles
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/articles/${article.slug}`} aria-current="page">
            {article.slug}
          </Link>
        </nav>
        <div className="reader-toolbar-actions">
          <StatusBadge status={article.status} />
          <Link
            className="reader-action-button"
            href={`/articles/${article.slug}/edit`}
          >
            Edit
          </Link>
          {article.availableTransitions.map((status) => (
            <button
              className={status === "published" ? "reader-primary-action" : ""}
              type="button"
              key={status}
              disabled={Boolean(workingAction)}
              onClick={() => void changeStatus(status)}
            >
              {workingAction === status ? "Updating…" : transitionLabel(status)}
            </button>
          ))}
          {article.canDelete ? (
            <button
              className="reader-delete-action"
              type="button"
              disabled={Boolean(workingAction)}
              onClick={() => setConfirmingDelete(true)}
            >
              {workingAction === "delete" ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
      {actionError ? (
        <p className="reader-action-error" role="alert">
          {actionError}
        </p>
      ) : null}
      <article className="reader-sheet">
        <header>
          <p className="reader-edition">
            {article.category.name} · Version {article.version}
          </p>
          <h1>{article.title}</h1>
          <p className="reader-summary">{article.summary}</p>
          <div className="reader-byline">
            <span>{initials(article.author.displayName)}</span>
            <p>
              <strong>{article.author.displayName ?? "Mikozi admin"}</strong>
              <small>Created {formatDate(article.createdAt)}</small>
            </p>
          </div>
        </header>
        {article.heroImageUrl ? (
          <figure className="reader-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.heroImageUrl} alt="" />
          </figure>
        ) : null}
        <div className="reader-body">
          {article.sections.map((section) => (
            <ArticleSectionView key={section.id} section={section} />
          ))}
        </div>
      </article>
      <section
        className="article-engagement-preview"
        aria-labelledby="engagement-heading"
      >
        <header>
          <h2 id="engagement-heading">Reader engagement</h2>
          <span>Planned</span>
        </header>
        <div>
          <article>
            <Icon name="activity" />
            <strong>Likes</strong>
            <span>Not available</span>
          </article>
          <article>
            <Icon name="articles" />
            <strong>Comments</strong>
            <span>Not available</span>
          </article>
        </div>
      </section>
      {confirmingDelete ? (
        <div className="reader-confirm-overlay">
          <section
            className="reader-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-article-heading"
          >
            <span className="reader-confirm-icon">
              <Icon name="trash" />
            </span>
            <h2 id="delete-article-heading">Delete article?</h2>
            <p>{article.title}</p>
            <div>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                type="button"
                onClick={() => void remove()}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function transitionLabel(status: Article["status"]): string {
  return {
    draft: "Restore to draft",
    published: "Publish",
    archived: "Archive",
  }[status];
}

function initials(name: string | null): string {
  return (name ?? "Mikozi admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
