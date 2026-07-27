import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .transform((value) => {
    if (value.startsWith("+265")) return value.slice(1);
    if (value.startsWith("0")) return `265${value.slice(1)}`;
    if (/^[1-9]\d{8}$/.test(value)) return `265${value}`;
    return value;
  })
  .pipe(
    z.string().regex(/^265[1-9]\d{8}$/, "Enter a valid Malawi phone number."),
  );

export const requestOtpSchema = z.object({
  phoneNumber: phoneSchema,
});

export const verifyOtpSchema = z.object({
  challengeId: z.uuid(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export function formatPhoneForDisplay(phoneNumber: string): string {
  const normalized = phoneSchema.safeParse(phoneNumber);
  if (!normalized.success) return phoneNumber;

  const value = normalized.data;
  return `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9)}`;
}
