"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
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
    if (
      !window.confirm(
        `Delete “${currentArticle.title}”? It will be removed from the newsroom.`,
      )
    ) {
      return;
    }
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
          <span className="status-chip">{article.status}</span>
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
              onClick={() => void remove()}
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
            Version {article.version} · {article.slug}
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
          <div>
            <p className="eyebrow">Reader engagement</p>
            <h2 id="engagement-heading">Comments and likes</h2>
          </div>
          <span>Planned</span>
        </header>
        <div>
          <article>
            <Icon name="activity" />
            <div>
              <strong>Likes</strong>
              <p>
                Counts and reader reactions will appear here when the engagement
                API is connected.
              </p>
            </div>
            <span>Not available</span>
          </article>
          <article>
            <Icon name="articles" />
            <div>
              <strong>Comments</strong>
              <p>
                Comment review, moderation state, and replies will live in this
                article context.
              </p>
            </div>
            <span>Not available</span>
          </article>
        </div>
      </section>
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
