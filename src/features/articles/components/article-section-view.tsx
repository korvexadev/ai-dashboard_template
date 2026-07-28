import type { Article } from "@/lib/api/contracts";

import { ArticleMarkdown } from "./article-markdown";

type Section = Article["sections"][number];

export function ArticleSectionView({ section }: { section: Section }) {
  if (section.type === "rich_text") {
    return (
      <section className="reader-rich-text">
        <ArticleMarkdown value={section.body ?? ""} />
      </section>
    );
  }

  if (section.type === "image") {
    return (
      <figure className="reader-media">
        {/* External editorial sources are intentionally unrestricted here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.mediaUrl ?? ""} alt={section.altText ?? ""} />
        {section.caption ? <figcaption>{section.caption}</figcaption> : null}
      </figure>
    );
  }

  if (section.type === "youtube") {
    return (
      <figure className="reader-media">
        <div className="video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${section.youtubeVideoId ?? ""}`}
            title={section.caption ?? "Article video"}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {section.caption ? <figcaption>{section.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <aside className="reader-advert">
      <span>Advert placement</span>
      <strong>{section.advertPlacementCode}</strong>
    </aside>
  );
}
