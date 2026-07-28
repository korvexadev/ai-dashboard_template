import type { components } from "./generated";

export type AdminAccess = components["schemas"]["AdminAccessResponseDto"];
export type Profile = components["schemas"]["ProfileResponseDto"];
export type Tokens = components["schemas"]["TokensResponseDto"];
export type VerifiedIdentity =
  components["schemas"]["VerifiedIdentityResponseDto"];
export type OtpChallenge = components["schemas"]["OtpChallengeResponseDto"];
export type Article = components["schemas"]["ArticleResponseDto"];
export type ArticleSummary = components["schemas"]["ArticleSummaryResponseDto"];
export type ArticleCollection =
  components["schemas"]["ArticleCollectionResponseDto"];
export type CreateArticle = components["schemas"]["CreateArticleDto"];
export type UpdateArticle = components["schemas"]["UpdateArticleDto"];
export type UpdateArticleStatus =
  components["schemas"]["UpdateArticleStatusDto"];
export type CreateArticleSection =
  components["schemas"]["CreateArticleSectionDto"];
export type AuditLog = components["schemas"]["AuditLogResponseDto"];
export type AuditLogCollection =
  components["schemas"]["AuditLogCollectionResponseDto"];

export interface ApiEnvelope<T> {
  data: T;
  meta: components["schemas"]["ApiMetaDto"];
}
