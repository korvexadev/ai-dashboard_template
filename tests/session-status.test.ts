import { describe, expect, it } from "vitest";

import { shouldClearSession } from "../src/lib/auth/session-status";

describe("shouldClearSession", () => {
  it.each([400, 401, 403, 404, 422])(
    "clears credentials for authoritative status %s",
    (status) => {
      expect(shouldClearSession(status)).toBe(true);
    },
  );

  it.each([408, 425, 429, 500, 502, 503, 504])(
    "preserves credentials for transient status %s",
    (status) => {
      expect(shouldClearSession(status)).toBe(false);
    },
  );
});
