import { Suspense } from "react";

import { ArticlesList } from "@/features/articles/components/articles-list";

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="article-skeletons" aria-label="Loading articles" />
      }
    >
      <ArticlesList />
    </Suspense>
  );
}
