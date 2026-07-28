"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { ArticleApiError, getArticle } from "@/features/articles/api/articles";
import type { Article } from "@/lib/api/contracts";

import { ArticleComposer } from "./article-composer";

export function ArticleEditor({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void getArticle(slug)
      .then(setArticle)
      .catch((caught: unknown) => {
        if (caught instanceof ArticleApiError && caught.status === 401) {
          window.location.assign("/auth");
          return;
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "The article could not be loaded.",
        );
      });
  }, [slug]);

  if (error) {
    return (
      <main className="article-workspace">
        <div className="reader-state">
          <Icon name="articles" />
          <h2>Article unavailable</h2>
          <p>{error}</p>
          <Link href={`/articles/${slug}`}>Return to article</Link>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="article-workspace">
        <div className="reader-loading" aria-label="Loading article editor">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }

  return <ArticleComposer article={article} />;
}
