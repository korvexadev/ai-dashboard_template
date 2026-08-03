import { describe, expect, it } from "vitest";

import {
  formatPhoneForDisplay,
  phoneSchema,
  verifyOtpSchema,
} from "../src/features/auth/schemas/auth.schema";

describe("phoneSchema", () => {
  it.each([
    ["0881001100", "265881001100"],
    ["881001100", "265881001100"],
    ["265881001100", "265881001100"],
    ["+265 881 001 100", "265881001100"],
  ])("normalizes %s", (input, expected) => {
    expect(phoneSchema.parse(input)).toBe(expected);
  });

  it.each(["", "+265881", "+266881001100", "+2658810011009"])(
    "rejects %s",
    (input) => {
      expect(phoneSchema.safeParse(input).success).toBe(false);
    },
  );

  it("formats a valid number without changing its value", () => {
    expect(formatPhoneForDisplay("265881001100")).toBe("+265 881 001 100");
  });
});

describe("verifyOtpSchema", () => {
  const challengeId = "739660c6-d741-4bda-8862-36bc8664f8a7";

  it("accepts a six-digit OTP and UUID challenge", () => {
    expect(
      verifyOtpSchema.safeParse({ challengeId, code: "123456" }).success,
    ).toBe(true);
  });

  it.each(["12345", "1234567", "12a456"])("rejects invalid OTP %s", (code) => {
    expect(verifyOtpSchema.safeParse({ challengeId, code }).success).toBe(
      false,
    );
  });
});
