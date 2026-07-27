"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons/icon";
import {
  formatPhoneForDisplay,
  phoneSchema,
} from "@/features/auth/schemas/auth.schema";

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
  const codeInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
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
    if (step === "code") codeInput.current?.focus();
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
      setStep("code");
    } catch {
      setError("Could not reach Mikozi. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!challenge || !/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId, code }),
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
    setCode("");
    setError("");
  }

  return (
    <section className="auth-form-panel" aria-labelledby="auth-title">
      <div className="auth-form-inner">
        <div className="auth-step-label">
          <span>{step === "phone" ? "01" : "02"}</span>
          <span aria-hidden="true" />
          <span>Secure newsroom access</span>
        </div>

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
                placeholder="+265 88 140 2533"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-describedby={error ? "auth-error" : "phone-hint"}
                aria-invalid={Boolean(error)}
              />
            </div>
            <p className="field-hint" id="phone-hint">
              Malawi numbers only. Standard SMS rates may apply.
            </p>
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
            <label className="field-label" htmlFor="otp">
              Verification code
            </label>
            <input
              ref={codeInput}
              className="otp-field"
              id="otp"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              aria-describedby={error ? "auth-error" : "otp-hint"}
              aria-invalid={Boolean(error)}
            />
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
            <button className="primary-button" disabled={busy} type="submit">
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

        <p className="auth-support">
          Need access? Contact your newsroom administrator.
        </p>
      </div>
    </section>
  );
}
