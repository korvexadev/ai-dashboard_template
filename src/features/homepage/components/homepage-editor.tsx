"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import {
  createCategory,
  getCategories,
  getHomepageLayout,
  getPublishedArticles,
  saveHomepageLayout,
  updateCategory,
} from "@/features/homepage/api/homepage";
import type {
  ArticleCategory,
  ArticleSummary,
  SaveHomepageSection,
} from "@/lib/api/contracts";

type Placement = "auto" | "top" | "more" | "hidden";
type DraftSection = SaveHomepageSection & { clientId: string };

const sectionOptions: Array<{
  value: DraftSection["type"];
  label: string;
  description: string;
}> = [
  { value: "banner", label: "Banner", description: "Large lead story" },
  { value: "list", label: "List", description: "Vertical article rows" },
  {
    value: "horizontal_list",
    label: "Horizontal list",
    description: "Swipeable story cards",
  },
  { value: "advert", label: "Advert", description: "Reserved ad placement" },
  {
    value: "categories",
    label: "Categories",
    description: "Links to other category tabs",
  },
];

export function HomepageEditor() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [sections, setSections] = useState<DraftSection[]>([]);
  const [version, setVersion] = useState(1);
  const [autoFillMore, setAutoFillMore] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [categoryItems, layout, articleCollection] = await Promise.all([
        getCategories(),
        getHomepageLayout(),
        getPublishedArticles(),
      ]);
      setCategories(categoryItems);
      setArticles(articleCollection.items);
      setVersion(layout.version);
      setAutoFillMore(layout.autoFillMore);
      setPlacements(
        Object.fromEntries(
          categoryItems.map((category) => [
            category.id,
            layout.categories.find((item) => item.id === category.id)
              ?.placement ?? "auto",
          ]),
        ),
      );
      setSections(
        layout.sections.map((section) => ({
          ...section,
          clientId: section.id,
        })),
      );
      setActiveTab((current) => current || categoryItems[0]?.id || "");
    } catch (loadError) {
      setError(message(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setError("");
    try {
      const category = await createCategory({
        name: newCategory.trim(),
        sortOrder: categories.length,
      });
      setCategories((current) => [...current, category]);
      setPlacements((current) => ({ ...current, [category.id]: "auto" }));
      setNewCategory("");
      setActiveTab(category.id);
      setNotice("Category created. Save the layout to choose its placement.");
    } catch (createError) {
      setError(message(createError));
    }
  }

  function addSection(categoryId: string) {
    setPlacements((current) => ({
      ...current,
      [categoryId]:
        current[categoryId] === "auto" ? "more" : current[categoryId],
    }));
    setSections((current) => [
      ...current,
      {
        clientId: crypto.randomUUID(),
        categoryId,
        type: "list",
        populationMode: "automatic",
        itemLimit: 8,
        articleIds: [],
        categoryIds: [],
      },
    ]);
  }

  function updateSection(clientId: string, patch: Partial<DraftSection>) {
    setSections((current) =>
      current.map((section) =>
        section.clientId === clientId ? { ...section, ...patch } : section,
      ),
    );
  }

  function moveSection(clientId: string, direction: -1 | 1) {
    setSections((current) => {
      const index = current.findIndex((item) => item.clientId === clientId);
      const section = current[index];
      if (!section) return current;
      const sameTab = current
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter(({ item }) => item.categoryId === section.categoryId);
      const tabIndex = sameTab.findIndex(
        ({ item }) => item.clientId === clientId,
      );
      const target = sameTab[tabIndex + direction];
      if (!target) return current;
      const next = [...current];
      [next[index], next[target.itemIndex]] = [
        next[target.itemIndex],
        next[index],
      ];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveHomepageLayout({
        expectedVersion: version,
        autoFillMore,
        categories: categories
          .filter(
            (category) =>
              category.status === "active" &&
              placements[category.id] !== "auto",
          )
          .map((category) => ({
            categoryId: category.id,
            placement: placements[category.id] as Exclude<Placement, "auto">,
          })),
        sections: sections.map(toSaveSection),
      });
      setVersion(saved.version);
      setSections(
        saved.sections.map((section) => ({
          ...section,
          clientId: section.id,
        })),
      );
      setNotice(`Homepage version ${saved.version} is live.`);
    } catch (saveError) {
      setError(message(saveError));
    } finally {
      setSaving(false);
    }
  }

  const activeCategories = categories.filter(
    (category) => category.status === "active",
  );
  const tabSections = sections.filter(
    (section) => section.categoryId === activeTab,
  );
  const duplicateCount = duplicateArticleCount(sections);

  if (loading) {
    return (
      <main className="homepage-studio">
        <div className="module-loading">Loading homepage configuration…</div>
      </main>
    );
  }

  return (
    <main className="homepage-studio">
      <header className="homepage-studio-header">
        <div>
          <p className="eyebrow">Mobile experience</p>
          <h2>Homepage studio</h2>
          <p>
            Control navigation, story layouts, curation, and automatic filling
            from one versioned document.
          </p>
        </div>
        <div className="homepage-save-block">
          <small>Current version {version}</small>
          <button
            className="solid-button"
            type="button"
            onClick={() => void save()}
            disabled={saving || duplicateCount > 0}
          >
            {saving ? "Saving…" : "Publish layout"}
          </button>
        </div>
      </header>

      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="success-notice">{notice}</p> : null}
      {duplicateCount ? (
        <p className="form-error">
          Remove {duplicateCount} repeated article selection
          {duplicateCount === 1 ? "" : "s"}. A story can appear once per tab.
        </p>
      ) : null}

      <div className="homepage-studio-grid">
        <div className="homepage-editor-column">
          <section className="homepage-control-section">
            <div className="homepage-section-title">
              <div>
                <h3>Category navigation</h3>
                <p>Choose the primary rail, More menu, or hide a category.</p>
              </div>
              <label className="compact-check">
                <input
                  type="checkbox"
                  checked={autoFillMore}
                  onChange={(event) => setAutoFillMore(event.target.checked)}
                />
                Prefill unassigned categories under More
              </label>
            </div>

            <form className="category-create-row" onSubmit={addCategory}>
              <label>
                <span>New category</span>
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  maxLength={80}
                  placeholder="Category name"
                />
              </label>
              <button className="outline-button" type="submit">
                <Icon name="plus" /> Add category
              </button>
            </form>

            <div className="category-placement-list">
              {categories.map((category) => (
                <div className="category-placement-row" key={category.id}>
                  <button
                    className="category-name-button"
                    type="button"
                    onClick={() => setActiveTab(category.id)}
                  >
                    <strong>{category.name}</strong>
                    <small>
                      /{category.slug}, {category.articleCount} articles
                    </small>
                  </button>
                  {category.status === "archived" ? (
                    <button
                      className="text-button"
                      type="button"
                      onClick={() =>
                        void updateCategory(category.id, {
                          status: "active",
                          sortOrder: category.sortOrder,
                        }).then(load)
                      }
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <label>
                        <span className="sr-only">
                          Placement for {category.name}
                        </span>
                        <select
                          value={placements[category.id] ?? "auto"}
                          onChange={(event) =>
                            setPlacements((current) => ({
                              ...current,
                              [category.id]: event.target.value as Placement,
                            }))
                          }
                        >
                          <option value="auto">Auto More</option>
                          <option value="top">Top navigation</option>
                          <option value="more">Under More</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </label>
                      <button
                        className="text-button danger-text"
                        type="button"
                        onClick={() =>
                          void updateCategory(category.id, {
                            status: "archived",
                            sortOrder: category.sortOrder,
                          }).then(load)
                        }
                      >
                        Archive
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="homepage-control-section">
            <div className="homepage-section-title">
              <div>
                <h3>Sections by category</h3>
                <p>
                  Automatic sections use the newest eligible stories and skip
                  anything already shown above.
                </p>
              </div>
              {activeTab ? (
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => addSection(activeTab)}
                >
                  <Icon name="plus" /> Add section
                </button>
              ) : null}
            </div>

            <div className="homepage-tab-strip" role="tablist">
              {activeCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === category.id}
                  className={activeTab === category.id ? "active" : undefined}
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="homepage-section-stack">
              {tabSections.length ? (
                tabSections.map((section, index) => (
                  <SectionCard
                    key={section.clientId}
                    section={section}
                    index={index}
                    count={tabSections.length}
                    articles={articles.filter(
                      (article) => article.category.id === section.categoryId,
                    )}
                    categories={activeCategories.filter(
                      (category) => category.id !== section.categoryId,
                    )}
                    onChange={(patch) => updateSection(section.clientId, patch)}
                    onMove={(direction) =>
                      moveSection(section.clientId, direction)
                    }
                    onRemove={() =>
                      setSections((current) =>
                        current.filter(
                          (item) => item.clientId !== section.clientId,
                        ),
                      )
                    }
                  />
                ))
              ) : (
                <div className="homepage-empty">
                  <strong>No sections in this tab</strong>
                  <p>Add a section to define how its articles appear.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <HomepagePhonePreview
          categories={activeCategories}
          placements={placements}
          activeTab={activeTab}
          sections={tabSections}
          articles={articles}
          autoFillMore={autoFillMore}
        />
      </div>
    </main>
  );
}

function SectionCard({
  section,
  index,
  count,
  articles,
  categories,
  onChange,
  onMove,
  onRemove,
}: {
  section: DraftSection;
  index: number;
  count: number;
  articles: ArticleSummary[];
  categories: ArticleCategory[];
  onChange: (patch: Partial<DraftSection>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const contentSection =
    section.type !== "advert" && section.type !== "categories";
  return (
    <article className="homepage-section-card">
      <div className="homepage-section-card-head">
        <span>{index + 1}</span>
        <div>
          <strong>
            {sectionOptions.find((item) => item.value === section.type)?.label}
          </strong>
          <small>
            {
              sectionOptions.find((item) => item.value === section.type)
                ?.description
            }
          </small>
        </div>
        <div className="homepage-order-actions">
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
      </div>

      <div className="homepage-section-fields">
        <label>
          <span>Layout</span>
          <select
            value={section.type}
            onChange={(event) => {
              const type = event.target.value as DraftSection["type"];
              onChange({
                type,
                populationMode:
                  type === "advert" || type === "categories"
                    ? "curated"
                    : "automatic",
                articleIds: [],
                categoryIds: [],
                advertPlacementCode: null,
              });
            }}
          >
            {sectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Section title</span>
          <input
            value={section.title ?? ""}
            onChange={(event) => onChange({ title: event.target.value })}
            maxLength={120}
            placeholder="Optional"
          />
        </label>
        {contentSection ? (
          <>
            <label>
              <span>Population</span>
              <select
                value={section.populationMode}
                onChange={(event) =>
                  onChange({
                    populationMode: event.target
                      .value as DraftSection["populationMode"],
                    articleIds:
                      event.target.value === "automatic"
                        ? []
                        : section.articleIds,
                  })
                }
              >
                <option value="automatic">Automatic</option>
                <option value="curated">Curated</option>
                <option value="hybrid">Curated then automatic</option>
              </select>
            </label>
            <label>
              <span>Item limit</span>
              <input
                type="number"
                min={1}
                max={30}
                value={section.itemLimit}
                onChange={(event) =>
                  onChange({ itemLimit: Number(event.target.value) })
                }
              />
            </label>
          </>
        ) : null}
      </div>

      {contentSection && section.populationMode !== "automatic" ? (
        <label className="homepage-multi-select">
          <span>Curated published articles</span>
          <select
            multiple
            value={section.articleIds}
            onChange={(event) =>
              onChange({
                articleIds: Array.from(
                  event.currentTarget.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
          >
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
          <small>Use Ctrl or Command to select multiple stories.</small>
        </label>
      ) : null}
      {section.type === "categories" ? (
        <label className="homepage-multi-select">
          <span>Linked categories</span>
          <select
            multiple
            value={section.categoryIds}
            onChange={(event) =>
              onChange({
                categoryIds: Array.from(
                  event.currentTarget.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {section.type === "advert" ? (
        <label>
          <span>Advert placement code</span>
          <input
            value={section.advertPlacementCode ?? ""}
            onChange={(event) =>
              onChange({ advertPlacementCode: event.target.value })
            }
            placeholder="home.category.inline"
          />
        </label>
      ) : null}
    </article>
  );
}

function HomepagePhonePreview({
  categories,
  placements,
  activeTab,
  sections,
  articles,
  autoFillMore,
}: {
  categories: ArticleCategory[];
  placements: Record<string, Placement>;
  activeTab: string;
  sections: DraftSection[];
  articles: ArticleSummary[];
  autoFillMore: boolean;
}) {
  const top = categories.filter(
    (category) => placements[category.id] === "top",
  );
  const activeName =
    categories.find((category) => category.id === activeTab)?.name ?? "Today";
  return (
    <aside className="homepage-preview-panel">
      <div className="preview-panel-heading">
        <div>
          <h3>Live mobile structure</h3>
          <p>Content eligibility is confirmed when the backend saves.</p>
        </div>
        <span>Draft</span>
      </div>
      <div className="homepage-phone">
        <div className="homepage-phone-status">9:41</div>
        <header>
          <strong>Mikozi</strong>
          <small>{activeName}</small>
        </header>
        <nav>
          {top.map((category) => (
            <span
              key={category.id}
              className={category.id === activeTab ? "active" : undefined}
            >
              {category.name}
            </span>
          ))}
          <span>More</span>
        </nav>
        <div className="homepage-phone-content">
          {sections.map((section) => {
            const chosen = articles.filter((article) =>
              section.articleIds.includes(article.id),
            );
            return (
              <section key={section.clientId} data-layout={section.type}>
                {section.title ? <h4>{section.title}</h4> : null}
                {section.type === "advert" ? (
                  <div className="phone-advert">
                    Advert: {section.advertPlacementCode || "placement needed"}
                  </div>
                ) : section.type === "categories" ? (
                  <div className="phone-category-links">
                    {section.categoryIds.map((id) => (
                      <span key={id}>
                        {categories.find((category) => category.id === id)
                          ?.name ?? "Category"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="phone-story-list">
                    {chosen.map((article) => (
                      <article key={article.id}>
                        <div />
                        <strong>{article.title}</strong>
                      </article>
                    ))}
                    {section.populationMode !== "curated" ? (
                      <article className="automatic-story">
                        <div />
                        <strong>
                          Automatic fill up to {section.itemLimit} stories
                        </strong>
                      </article>
                    ) : null}
                  </div>
                )}
              </section>
            );
          })}
          {!sections.length ? (
            <div className="phone-empty">
              Add a section to this category tab.
            </div>
          ) : null}
        </div>
      </div>
      <p className="homepage-preview-note">
        {autoFillMore
          ? "Unassigned active categories will appear under More."
          : "Only explicitly placed categories will be visible."}
      </p>
    </aside>
  );
}

function duplicateArticleCount(sections: DraftSection[]): number {
  const tabs = new Map<string, Set<string>>();
  let duplicates = 0;
  for (const section of sections) {
    const seen = tabs.get(section.categoryId) ?? new Set<string>();
    for (const id of section.articleIds) {
      if (seen.has(id)) duplicates += 1;
      seen.add(id);
    }
    tabs.set(section.categoryId, seen);
  }
  return duplicates;
}

function toSaveSection(section: DraftSection): SaveHomepageSection {
  return {
    ...(section.id ? { id: section.id } : {}),
    categoryId: section.categoryId,
    title: section.title,
    type: section.type,
    populationMode: section.populationMode,
    itemLimit: section.itemLimit,
    advertPlacementCode: section.advertPlacementCode,
    articleIds: section.articleIds,
    categoryIds: section.categoryIds,
  };
}

function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The homepage operation failed.";
}
