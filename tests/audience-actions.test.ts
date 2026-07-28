import { describe, expect, it } from "vitest";

import { canModerateAudienceUser } from "../src/features/audience/policies/audience-actions";

describe("audience moderation actions", () => {
  it("never permits destructive self-actions", () => {
    expect(canModerateAudienceUser(true, "reader-id", "reader-id")).toBe(false);
  });

  it("requires management authority for another reader", () => {
    expect(canModerateAudienceUser(false, "actor-id", "reader-id")).toBe(false);
    expect(canModerateAudienceUser(true, "actor-id", "reader-id")).toBe(true);
  });
});
