import type { components } from "./generated";

export type AdminAccess = components["schemas"]["AdminAccessResponseDto"];
export type Profile = components["schemas"]["ProfileResponseDto"];
export type Tokens = components["schemas"]["TokensResponseDto"];
export type VerifiedIdentity =
  components["schemas"]["VerifiedIdentityResponseDto"];
export type OtpChallenge = components["schemas"]["OtpChallengeResponseDto"];

export interface ApiEnvelope<T> {
  data: T;
  meta: components["schemas"]["ApiMetaDto"];
}
