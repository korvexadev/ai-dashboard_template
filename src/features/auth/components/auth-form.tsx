"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons/icon";
import {
  formatPhoneForDisplay,
  phoneSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  applyOtpInput,
  emptyOtpDigits,
  OTP_LENGTH,
  otpCode,
} from "@/features/auth/otp-code";

const REMEMBERED_PHONE_KEY = "mikozi:last-admin-phone";

interface Challenge {
  challengeId: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

interface ApiError {
  error?: { message?: string };
}

export function AuthForm() {
  const router = useRouter();
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);
  const lastSubmittedCode = useRef<string | null>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [digits, setDigits] = useState(emptyOtpDigits);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [remember, setRemember] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberedPhone = window.localStorage.getItem(REMEMBERED_PHONE_KEY);
    if (!rememberedPhone) return;

    const hydration = window.setTimeout(() => setPhone(rememberedPhone), 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (step === "code") otpInputs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [remaining]);

  async function requestCode() {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the phone number.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phoneNumber: parsed.data }),
      });
      const body = (await response.json()) as Challenge & ApiError;
      if (!response.ok) {
        setError(body.error?.message ?? "We could not send that code.");
        return;
      }

      setChallenge(body);
      setNormalizedPhone(parsed.data);
      setRemaining(body.resendAfterSeconds);
      setDigits(emptyOtpDigits());
      lastSubmittedCode.current = null;
      setStep("code");
    } catch {
      setError("Could not reach Mikozi. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(codeToVerify = otpCode(digits)) {
    if (!challenge || !/^\d{6}$/.test(codeToVerify) || busy) {
      setError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          code: codeToVerify,
        }),
      });
      const body = (await response.json()) as ApiError;
      if (!response.ok) {
        setError(body.error?.message ?? "That code could not be verified.");
        return;
      }

      if (remember) {
        window.localStorage.setItem(REMEMBERED_PHONE_KEY, normalizedPhone);
      } else {
        window.localStorage.removeItem(REMEMBERED_PHONE_KEY);
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not reach Mikozi. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function editPhone() {
    setStep("phone");
    setChallenge(null);
    setDigits(emptyOtpDigits());
    lastSubmittedCode.current = null;
    setError("");
  }

  function updateDigit(index: number, value: string) {
    const next = applyOtpInput(digits, index, value);
    const nextCode = otpCode(next);
    setDigits(next);
    setError("");
    if (nextCode !== lastSubmittedCode.current) {
      lastSubmittedCode.current = null;
    }

    const nextEmpty = next.findIndex(
      (digit, digitIndex) => digitIndex > index && !digit,
    );
    const focusIndex = nextEmpty >= 0 ? nextEmpty : Math.min(index + 1, 5);
    otpInputs.current[focusIndex]?.focus();

    if (/^\d{6}$/.test(nextCode) && !busy) {
      lastSubmittedCode.current = nextCode;
      void verifyCode(nextCode);
    }
  }

  function handleOtpKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputs.current[index + 1]?.focus();
    }
  }

  return (
    <section className="auth-form-panel" aria-labelledby="auth-title">
      <div className="auth-form-inner">
        <h1 id="auth-title">
          {step === "phone" ? "Welcome to the desk." : "Check your messages."}
        </h1>
        <p className="auth-intro">
          {step === "phone"
            ? "Use the mobile number assigned to your Mikozi administrator account."
            : `We sent a six-digit code to ${formatPhoneForDisplay(normalizedPhone)}.`}
        </p>

        {step === "phone" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void requestCode();
            }}
          >
            <label className="field-label" htmlFor="phone">
              Phone number
            </label>
            <div className="phone-field">
              <span aria-hidden="true">MW</span>
              <input
                id="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+265 88 100 1100"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-describedby={error ? "auth-error" : undefined}
                aria-invalid={Boolean(error)}
              />
            </div>
            <button className="primary-button" disabled={busy} type="submit">
              <span>{busy ? "Sending code…" : "Continue with phone"}</span>
              <span className="button-arrow" aria-hidden="true">
                <Icon name="arrowRight" />
              </span>
            </button>
          </form>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verifyCode();
            }}
          >
            <span className="field-label" id="otp-label">
              Verification code
            </span>
            <div
              className="otp-fields"
              role="group"
              aria-labelledby="otp-label"
              aria-describedby={error ? "auth-error" : "otp-hint"}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpInputs.current[index] = node;
                  }}
                  className="otp-field"
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  aria-invalid={Boolean(error)}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  inputMode="numeric"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  disabled={busy}
                  value={digit}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(event, index)}
                  onPaste={(event) => {
                    event.preventDefault();
                    updateDigit(index, event.clipboardData.getData("text"));
                  }}
                />
              ))}
            </div>
            <div className="otp-actions" id="otp-hint">
              <button type="button" onClick={editPhone}>
                Change number
              </button>
              <button
                type="button"
                disabled={remaining > 0 || busy}
                onClick={() => void requestCode()}
              >
                {remaining > 0 ? `Resend in ${remaining}s` : "Resend code"}
              </button>
            </div>
            <label className="remember-field">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Remember this phone number on this device</span>
            </label>
            <button
              className="primary-button"
              disabled={busy || otpCode(digits).length !== OTP_LENGTH}
              type="submit"
            >
              <span>{busy ? "Verifying…" : "Enter newsroom"}</span>
              <span className="button-arrow" aria-hidden="true">
                <Icon name="arrowRight" />
              </span>
            </button>
          </form>
        )}

        {error ? (
          <p className="auth-error" id="auth-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
