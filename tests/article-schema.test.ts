import { describe, expect, it } from "vitest";

import { articleDraftSchema } from "../src/features/articles/schemas/article.schema";

describe("articleDraftSchema", () => {
  const base = {
    title: "The lake that feeds a nation",
    summary: "A dispatch from the southern lakeshore.",
    categoryId: "22222222-2222-4222-8222-222222222222",
    heroImageUrl: "",
  };

  it("accepts ordered mixed-media sections", () => {
    const result = articleDraftSchema.safeParse({
      ...base,
      sections: [
        { type: "rich_text", body: "Opening paragraph." },
        {
          type: "image",
          mediaUrl: "https://cdn.example.com/lake.jpg",
          altText: "Fishing boats on Lake Malawi",
        },
        { type: "youtube", youtubeVideoId: "AbCdEf12345" },
        { type: "advert", advertPlacementCode: "article.inline.1" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("requires accessible image alternative text", () => {
    const result = articleDraftSchema.safeParse({
      ...base,
      sections: [
        {
          type: "image",
          mediaUrl: "https://cdn.example.com/lake.jpg",
          altText: "",
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("requires at least one section", () => {
    expect(
      articleDraftSchema.safeParse({ ...base, sections: [] }).success,
    ).toBe(false);
  });

  it("does not submit the retired section heading field", () => {
    const result = articleDraftSchema.parse({
      ...base,
      sections: [
        {
          type: "rich_text",
          heading: "Legacy heading",
          body: "Opening paragraph.",
        },
      ],
    });

    expect(result.sections[0]).not.toHaveProperty("heading");
  });
});
