export const OTP_LENGTH = 6;

export function emptyOtpDigits(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

export function applyOtpInput(
  current: string[],
  index: number,
  input: string,
): string[] {
  const next = [...current];
  const incoming = input.replace(/\D/g, "");
  if (!incoming) {
    next[index] = "";
    return next;
  }

  if (incoming.length === OTP_LENGTH) {
    return incoming.slice(0, OTP_LENGTH).split("");
  }

  incoming
    .slice(0, OTP_LENGTH - index)
    .split("")
    .forEach((digit, offset) => {
      next[index + offset] = digit;
    });
  return next;
}

export function otpCode(digits: string[]): string {
  return digits.join("");
}
