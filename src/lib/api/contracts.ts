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
export type AudienceUserStatus =
  components["schemas"]["AudienceUserStatusResponseDto"];
export type UpdateAudienceUserStatus =
  components["schemas"]["UpdateAudienceUserStatusDto"];
export type CommentActivity =
  components["schemas"]["CommentActivityResponseDto"];
export type CommentActivityCollection =
  components["schemas"]["CommentActivityCollectionResponseDto"];
export type LikeActivity = components["schemas"]["LikeActivityResponseDto"];
export type LikeActivityCollection =
  components["schemas"]["LikeActivityCollectionResponseDto"];
export type SubscriptionActivity =
  components["schemas"]["SubscriptionActivityResponseDto"];
export type SubscriptionActivityCollection =
  components["schemas"]["SubscriptionActivityCollectionResponseDto"];
export type TransactionActivity =
  components["schemas"]["TransactionActivityResponseDto"];
export type TransactionActivityCollection =
  components["schemas"]["TransactionActivityCollectionResponseDto"];
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
export type ReaderAccessPolicy =
  components["schemas"]["ReaderAccessPolicyResponseDto"];
export type UpdateReaderAccessPolicy =
  components["schemas"]["UpdateReaderAccessPolicyDto"];
export type AdminPaymentTransaction =
  components["schemas"]["AdminPaymentTransactionResponseDto"];
export type AdminPaymentTransactionCollection =
  components["schemas"]["AdminPaymentTransactionCollectionResponseDto"];
export type MediaAsset = components["schemas"]["MediaAssetResponseDto"];
export type MediaAssetCollection =
  components["schemas"]["MediaAssetCollectionResponseDto"];
export type CreateMediaAsset = components["schemas"]["CreateMediaAssetDto"];
export type UpdateMediaAsset = components["schemas"]["UpdateMediaAssetDto"];
export type NotificationDraft =
  components["schemas"]["NotificationDraftResponseDto"];
export type NotificationDraftCollection =
  components["schemas"]["NotificationDraftCollectionResponseDto"];
export type CreateNotificationDraft =
  components["schemas"]["CreateNotificationDraftDto"];
export type UpdateNotificationDraft =
  components["schemas"]["UpdateNotificationDraftDto"];
export type ArticleCategory = components["schemas"]["CategoryResponseDto"];
export type ArticleCategoryCollection =
  components["schemas"]["CategoryCollectionResponseDto"];
export type CreateArticleCategory = components["schemas"]["CreateCategoryDto"];
export type UpdateArticleCategory = components["schemas"]["UpdateCategoryDto"];
export type AdminHomepageLayout =
  components["schemas"]["AdminHomepageLayoutResponseDto"];
export type SaveHomepageLayout = components["schemas"]["SaveHomepageLayoutDto"];
export type SaveHomepageSection =
  components["schemas"]["SaveHomepageSectionDto"];
export type HomepageSnapshot =
  components["schemas"]["HomepageSnapshotResponseDto"];

export interface ApiEnvelope<T> {
  data: T;
  meta: components["schemas"]["ApiMetaDto"];
}
