import { ArticleEditor } from "@/features/articles/components/article-editor";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleEditor slug={slug} />;
}
