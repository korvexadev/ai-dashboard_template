import { ArticleReader } from "@/features/articles/components/article-reader";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleReader slug={slug} />;
}
