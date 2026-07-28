import { Icon } from "@/components/icons/icon";

import { ArticleMarkdown } from "./article-markdown";
import type { EditableSection } from "./section-editor";

export function ArticlePhonePreview({
  title,
  summary,
  heroImageUrl,
  sections,
}: {
  title: string;
  summary: string;
  heroImageUrl: string;
  sections: EditableSection[];
}) {
  return (
    <aside className="phone-preview-panel" aria-label="Live phone preview">
      <header>
        <div>
          <span>Live preview</span>
          <strong>Mobile article</strong>
        </div>
        <span className="preview-live-dot">Live</span>
      </header>
      <div className="phone-device">
        <div className="phone-speaker" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-app-bar">
            <span>Mikozi</span>
            <Icon name="more" />
          </div>
          <article className="phone-article">
            <header>
              <small>Draft preview</small>
              <h1>{title.trim() || "Your headline will appear here"}</h1>
              <p>
                {summary.trim() ||
                  "Add a short summary to introduce the article."}
              </p>
            </header>
            {heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="phone-hero" src={heroImageUrl} alt="" />
            ) : (
              <div className="phone-hero-placeholder">
                <Icon name="image" />
                <span>Hero image</span>
              </div>
            )}
            <div className="phone-article-body">
              {sections.map((section) => (
                <PreviewSection key={section.id} section={section} />
              ))}
            </div>
          </article>
        </div>
      </div>
      <p>Updates as you type. Scroll inside the device to review the story.</p>
    </aside>
  );
}

function PreviewSection({ section }: { section: EditableSection }) {
  if (section.type === "rich_text") {
    return section.body ? (
      <ArticleMarkdown value={section.body} className="phone-rich-text" />
    ) : (
      <div className="phone-empty-block">Rich text section</div>
    );
  }
  if (section.type === "image") {
    return section.mediaUrl ? (
      <figure className="phone-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.mediaUrl} alt={section.altText} />
        {section.caption ? <figcaption>{section.caption}</figcaption> : null}
      </figure>
    ) : (
      <div className="phone-empty-block">Image section</div>
    );
  }
  if (section.type === "youtube") {
    return (
      <figure className="phone-media">
        <div className="phone-video">
          <Icon name="video" />
          <span>{section.youtubeVideoId || "YouTube video"}</span>
        </div>
        {section.caption ? <figcaption>{section.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <div className="phone-advert">
      <span>Advertisement</span>
      <strong>{section.advertPlacementCode || "Placement"}</strong>
    </div>
  );
}
