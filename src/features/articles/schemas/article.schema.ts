import { z } from "zod";

const optionalText = z.string().trim().optional();

export const articleSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("rich_text"),
    body: z.string().trim().min(1, "Write the section text."),
  }),
  z.object({
    type: z.literal("image"),
    mediaUrl: z.url("Enter a valid image URL."),
    altText: z.string().trim().min(1, "Describe the image."),
    caption: optionalText,
  }),
  z.object({
    type: z.literal("youtube"),
    youtubeVideoId: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{6,20}$/, "Enter a valid YouTube video ID."),
    caption: optionalText,
  }),
  z.object({
    type: z.literal("advert"),
    advertPlacementCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9._-]{2,80}$/, "Enter a valid placement code."),
  }),
]);

export const articleDraftSchema = z.object({
  title: z.string().trim().min(1, "Add a headline.").max(180),
  summary: z.string().trim().min(1, "Add a summary.").max(500),
  categoryId: z.uuid("Select an article category."),
  heroImageUrl: z.union([z.literal(""), z.url("Enter a valid image URL.")]),
  sections: z
    .array(articleSectionSchema)
    .min(1, "Add at least one article section.")
    .max(100),
});

export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;
