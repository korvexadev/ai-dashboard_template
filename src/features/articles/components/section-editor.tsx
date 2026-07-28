"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Icon } from "@/components/icons/icon";

import { RichTextEditor } from "./rich-text-editor";

export type EditableSection = {
  id: string;
  type: "rich_text" | "image" | "youtube" | "advert";
  body: string;
  mediaUrl: string;
  caption: string;
  altText: string;
  youtubeVideoId: string;
  advertPlacementCode: string;
};

interface SectionEditorProps {
  section: EditableSection;
  index: number;
  count: number;
  error?: string;
  onChange: (section: EditableSection) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export function SectionEditor({
  section,
  index,
  count,
  error,
  onChange,
  onMove,
  onRemove,
}: SectionEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const update = (field: keyof EditableSection, value: string) =>
    onChange({ ...section, [field]: value });

  return (
    <article
      className={`section-editor${isDragging ? " is-dragging" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <header>
        <div>
          <button
            className="section-drag-handle"
            type="button"
            aria-label={`Drag ${sectionLabel(section.type)} section ${index + 1} to reorder`}
            {...attributes}
            {...listeners}
          >
            <Icon name="drag" />
          </button>
          <span className="section-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>
            <strong>{sectionLabel(section.type)}</strong>
            <small>Section {index + 1}</small>
          </span>
        </div>
        <div className="section-actions">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move section up"
          >
            <Icon name="arrowUp" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move section down"
          >
            <Icon name="arrowDown" />
          </button>
          <button type="button" onClick={onRemove} aria-label="Remove section">
            <Icon name="trash" />
          </button>
        </div>
      </header>

      {section.type === "rich_text" ? (
        <div className="section-field">
          <span>Story text</span>
          <RichTextEditor
            value={section.body}
            onChange={(value) => update("body", value)}
          />
        </div>
      ) : null}
      {section.type === "image" ? (
        <>
          <label>
            <span>Image URL</span>
            <input
              type="url"
              value={section.mediaUrl}
              onChange={(event) => update("mediaUrl", event.target.value)}
              placeholder="https://"
            />
          </label>
          <label>
            <span>Alternative text</span>
            <input
              value={section.altText}
              onChange={(event) => update("altText", event.target.value)}
              placeholder="Describe the image for readers who cannot see it"
            />
          </label>
          <OptionalCaption section={section} update={update} />
        </>
      ) : null}
      {section.type === "youtube" ? (
        <>
          <label>
            <span>YouTube video ID</span>
            <input
              value={section.youtubeVideoId}
              onChange={(event) =>
                update("youtubeVideoId", youtubeId(event.target.value))
              }
              placeholder="dQw4w9WgXcQ"
            />
          </label>
          <OptionalCaption section={section} update={update} />
        </>
      ) : null}
      {section.type === "advert" ? (
        <label>
          <span>Advert placement code</span>
          <input
            value={section.advertPlacementCode}
            onChange={(event) =>
              update("advertPlacementCode", event.target.value)
            }
            placeholder="article.inline.1"
          />
        </label>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </article>
  );
}

function OptionalCaption({
  section,
  update,
}: {
  section: EditableSection;
  update: (field: keyof EditableSection, value: string) => void;
}) {
  return (
    <label>
      <span>
        Caption <small>Optional</small>
      </span>
      <input
        value={section.caption}
        onChange={(event) => update("caption", event.target.value)}
        placeholder="Add context or attribution"
      />
    </label>
  );
}

function sectionLabel(type: EditableSection["type"]): string {
  return {
    rich_text: "Rich text",
    image: "Image",
    youtube: "YouTube video",
    advert: "Advert",
  }[type];
}

function youtubeId(value: string): string {
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]+)/,
  );
  return match?.[1] ?? value;
}
