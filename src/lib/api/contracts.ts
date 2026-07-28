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
export type OverviewAnalytics =
  components["schemas"]["OverviewAnalyticsResponseDto"];
export type DashboardUser = components["schemas"]["DashboardUserResponseDto"];
export type DashboardUserCollection =
  components["schemas"]["DashboardUserCollectionResponseDto"];
export type ProvisionDashboardUser =
  components["schemas"]["ProvisionDashboardUserDto"];
export type AudienceUserSummary =
  components["schemas"]["AudienceUserSummaryResponseDto"];
export type AudienceUserDetail =
  components["schemas"]["AudienceUserDetailResponseDto"];
export type AudienceUserCollection =
  components["schemas"]["AudienceUserCollectionResponseDto"];
export type ReaderEntitlement =
  components["schemas"]["ReaderEntitlementResponseDto"];
export type AssignReaderSubscription =
  components["schemas"]["AssignReaderSubscriptionDto"];
export type SubscriptionPlan =
  components["schemas"]["SubscriptionPlanResponseDto"];
export type SubscriptionPlanCollection =
  components["schemas"]["SubscriptionPlanCollectionResponseDto"];
export type CreateSubscriptionPlan =
  components["schemas"]["CreateSubscriptionPlanDto"];
export type UpdateSubscriptionPlan =
  components["schemas"]["UpdateSubscriptionPlanDto"];

export interface ApiEnvelope<T> {
  data: T;
  meta: components["schemas"]["ApiMetaDto"];
}
