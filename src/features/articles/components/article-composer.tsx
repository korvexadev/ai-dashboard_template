"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon, type IconName } from "@/components/icons/icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getCategories } from "@/features/categories/api/categories";
import { CategoryCreateDialog } from "@/features/categories/components/category-create-dialog";
import { createArticle, updateArticle } from "@/features/articles/api/articles";
import {
  articleDraftSchema,
  type ArticleDraftInput,
} from "@/features/articles/schemas/article.schema";
import type { Article } from "@/lib/api/contracts";
import type { ArticleCategory } from "@/lib/api/contracts";

import { ArticlePhonePreview } from "./article-phone-preview";
import { SectionEditor, type EditableSection } from "./section-editor";

const sectionTypes: Array<{
  type: EditableSection["type"];
  label: string;
  icon: IconName;
}> = [
  { type: "rich_text", label: "Rich text", icon: "text" },
  { type: "image", label: "Image", icon: "image" },
  { type: "youtube", label: "YouTube", icon: "video" },
  { type: "advert", label: "Advert", icon: "advert" },
];

export function ArticleComposer({ article }: { article?: Article }) {
  const router = useRouter();
  const editing = Boolean(article);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [categoryId, setCategoryId] = useState(article?.category.id ?? "");
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(article?.heroImageUrl ?? "");
  const [sections, setSections] = useState<EditableSection[]>(() =>
    article
      ? article.sections.map(toEditableSection)
      : [newSection("rich_text")],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getCategories()
      .then((items) => {
        const active = items.filter((item) => item.status === "active");
        setCategories(active);
        setCategoryId((current) => current || active[0]?.id || "");
      })
      .catch(() =>
        setErrors((current) => ({
          ...current,
          categoryId: "Categories could not be loaded.",
        })),
      );
  }, []);

  function addSection(type: EditableSection["type"]) {
    setSections((current) => [...current, newSection(type)]);
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function finishDrag(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    setSections((current) => {
      const from = current.findIndex(
        (section) => section.id === event.active.id,
      );
      const to = current.findIndex((section) => section.id === event.over?.id);
      return from < 0 || to < 0 ? current : arrayMove(current, from, to);
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    const parsed = articleDraftSchema.safeParse({
      title,
      summary,
      categoryId,
      heroImageUrl,
      sections: sections.map(toDraftSection),
    });
    if (!parsed.success) {
      setErrors(issueMap(parsed.error.issues, sections));
      return;
    }

    setSaving(true);
    try {
      const saved = article
        ? await updateArticle(article.slug, {
            ...toRequest(parsed.data),
            expectedVersion: article.version,
          })
        : await createArticle(toRequest(parsed.data));
      router.push(`/articles/${saved.slug}`);
      router.refresh();
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "The draft could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="article-workspace">
      <div className="page-title-row composer-title-row">
        <div>
          <Link className="back-link" href="/articles">
            <Icon name="back" /> Articles
          </Link>
          <h2>{editing ? "Edit article" : "New article"}</h2>
          <p>
            {editing
              ? `Revision ${Number(article?.version ?? 0) + 1}`
              : "Draft a new story."}
          </p>
        </div>
        <button
          className="solid-button"
          type="submit"
          form="article-composer"
          disabled={saving}
        >
          <Icon name="checkCircle" />
          {saving ? "Saving…" : editing ? "Save new revision" : "Save draft"}
        </button>
      </div>

      <form id="article-composer" className="composer-grid" onSubmit={submit}>
        <div className="composer-main">
          <section className="article-details-card" aria-label="Story details">
            <label>
              <span>Headline</span>
              <input
                className="headline-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={180}
                placeholder="Write a clear, specific headline"
              />
              {errors.title ? (
                <small className="field-error">{errors.title}</small>
              ) : null}
            </label>
            <label>
              <span>Summary</span>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="A concise description for editors and readers"
              />
              <small>{summary.length}/500</small>
              {errors.summary ? (
                <small className="field-error">{errors.summary}</small>
              ) : null}
            </label>
            <label>
              <span>Category</span>
              <SearchableSelect
                ariaLabel="Category"
                value={categoryId}
                options={[
                  { value: "", label: "Select a category" },
                  ...categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                    keywords: category.slug,
                  })),
                  { value: "__new_category__", label: "New category…" },
                ]}
                onChange={(value) => {
                  if (value === "__new_category__") {
                    setCreatingCategory(true);
                    return;
                  }
                  setCategoryId(value);
                }}
                placeholder="Select a category"
                searchPlaceholder="Search categories"
              />
              {errors.categoryId ? (
                <small className="field-error">{errors.categoryId}</small>
              ) : null}
            </label>
            <label>
              <span>
                Hero image URL <small>Optional</small>
              </span>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(event) => setHeroImageUrl(event.target.value)}
                placeholder="https://"
              />
              {errors.heroImageUrl ? (
                <small className="field-error">{errors.heroImageUrl}</small>
              ) : null}
            </label>
          </section>

          <div className="sections-heading">
            <h3>Article sections</h3>
            <span>{sections.length}</span>
          </div>
          <div className="section-add-toolbar">
            <span>Add content</span>
            <div>
              {sectionTypes.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => addSection(item.type)}
                  title={sectionHelp(item.type)}
                >
                  <Icon name={item.icon} />
                  {item.label}
                  <Icon name="plus" />
                </button>
              ))}
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={finishDrag}
          >
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="section-stack">
                {sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={index}
                    count={sections.length}
                    error={errors[section.id]}
                    onChange={(next) =>
                      setSections((current) =>
                        current.map((item) =>
                          item.id === section.id ? next : item,
                        ),
                      )
                    }
                    onMove={(direction) => moveSection(index, direction)}
                    onRemove={() =>
                      setSections((current) =>
                        current.filter((item) => item.id !== section.id),
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {errors.sections ? (
            <p className="form-error">{errors.sections}</p>
          ) : null}
          {errors.form ? <p className="form-error">{errors.form}</p> : null}
        </div>

        <ArticlePhonePreview
          title={title}
          summary={summary}
          heroImageUrl={heroImageUrl}
          sections={sections}
        />
      </form>
      <CategoryCreateDialog
        open={creatingCategory}
        sortOrder={categories.length}
        onClose={() => setCreatingCategory(false)}
        onCreated={(category) => {
          setCategories((current) => [...current, category]);
          setCategoryId(category.id);
          setErrors((current) => {
            const next = { ...current };
            delete next.categoryId;
            return next;
          });
        }}
      />
    </main>
  );
}

function newSection(type: EditableSection["type"]): EditableSection {
  return {
    id: crypto.randomUUID(),
    type,
    body: "",
    mediaUrl: "",
    caption: "",
    altText: "",
    youtubeVideoId: "",
    advertPlacementCode: "",
  };
}

function toEditableSection(
  section: Article["sections"][number],
): EditableSection {
  return {
    id: section.id,
    type: section.type,
    body: section.body ?? "",
    mediaUrl: section.mediaUrl ?? "",
    caption: section.caption ?? "",
    altText: section.altText ?? "",
    youtubeVideoId: section.youtubeVideoId ?? "",
    advertPlacementCode: section.advertPlacementCode ?? "",
  };
}

function toDraftSection(section: EditableSection) {
  const common = { type: section.type };
  if (section.type === "rich_text") return { ...common, body: section.body };
  if (section.type === "image") {
    return {
      ...common,
      mediaUrl: section.mediaUrl,
      altText: section.altText,
      caption: section.caption || undefined,
    };
  }
  if (section.type === "youtube") {
    return {
      ...common,
      youtubeVideoId: section.youtubeVideoId,
      caption: section.caption || undefined,
    };
  }
  return { ...common, advertPlacementCode: section.advertPlacementCode };
}

function toRequest(draft: ArticleDraftInput) {
  return {
    title: draft.title,
    summary: draft.summary,
    categoryId: draft.categoryId,
    ...(draft.heroImageUrl ? { heroImageUrl: draft.heroImageUrl } : {}),
    sections: draft.sections,
  };
}

function issueMap(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  sections: EditableSection[],
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const issue of issues) {
    if (issue.path[0] === "sections" && typeof issue.path[1] === "number") {
      mapped[sections[issue.path[1]]?.id ?? "sections"] ??= issue.message;
    } else {
      mapped[String(issue.path[0] ?? "form")] ??= issue.message;
    }
  }
  return mapped;
}

function sectionHelp(type: EditableSection["type"]): string {
  return {
    rich_text: "Paragraphs and subheads",
    image: "Image, alt text and caption",
    youtube: "A YouTube video embed",
    advert: "An advertising placement",
  }[type];
}
