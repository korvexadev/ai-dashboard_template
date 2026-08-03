import { describe, expect, it } from "vitest";

import {
  applyOtpInput,
  emptyOtpDigits,
  otpCode,
} from "../src/features/auth/otp-code";

describe("OTP code inputs", () => {
  it("places one digit without shifting the other boxes", () => {
    const next = applyOtpInput(["1", "2", "", "", "", ""], 2, "3");

    expect(next).toEqual(["1", "2", "3", "", "", ""]);
  });

  it("distributes a pasted or autofilled code across all boxes", () => {
    const next = applyOtpInput(emptyOtpDigits(), 0, "123 456");

    expect(next).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(otpCode(next)).toBe("123456");
  });

  it("clears only the selected box", () => {
    expect(applyOtpInput(["1", "2", "3", "4", "5", "6"], 3, "")).toEqual([
      "1",
      "2",
      "3",
      "",
      "5",
      "6",
    ]);
  });
});
