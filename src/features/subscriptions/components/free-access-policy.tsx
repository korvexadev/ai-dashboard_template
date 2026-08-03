"use client";

import { FormEvent, useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import {
  getReaderAccessPolicy,
  updateReaderAccessPolicy,
} from "@/features/subscriptions/api/subscriptions";
import type { ReaderAccessPolicy } from "@/lib/api/contracts";

interface PolicyForm {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
}

export function FreeAccessPolicy({ canManage }: { canManage: boolean }) {
  const [policy, setPolicy] = useState<ReaderAccessPolicy>();
  const [form, setForm] = useState<PolicyForm>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    void getReaderAccessPolicy()
      .then((value) => {
        if (!active) return;
        setPolicy(value);
        setForm(toForm(value));
      })
      .catch((caught: unknown) => {
        if (active) setError(message(caught));
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !form) return;
    setSaving(true);
    setError(undefined);
    try {
      const updated = await updateReaderAccessPolicy({
        freeAccessEnabled: form.enabled,
        freeAccessStartsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : null,
        freeAccessEndsAt: form.endsAt
          ? new Date(form.endsAt).toISOString()
          : null,
      });
      setPolicy(updated);
      setForm(toForm(updated));
    } catch (caught: unknown) {
      setError(message(caught));
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return error ? (
      <div className="free-access-error" role="alert">
        {error}
      </div>
    ) : (
      <div
        className="free-access-card free-access-loading"
        aria-label="Loading free access settings"
      />
    );
  }

  return (
    <form className="free-access-card" onSubmit={submit}>
      <div className="free-access-heading">
        <span className="free-access-icon">
          <Icon name="articles" />
        </span>
        <div>
          <h3>Free reading window</h3>
          <p>{policy?.freeAccessActive ? "Live now" : "Paywall active"}</p>
        </div>
      </div>

      <label className="free-access-switch">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(event) =>
            setForm({ ...form, enabled: event.target.checked })
          }
          disabled={!canManage}
        />
        <span aria-hidden="true" />
        <strong>{form.enabled ? "On" : "Off"}</strong>
      </label>

      <label>
        Starts
        <input
          type="datetime-local"
          value={form.startsAt}
          onChange={(event) =>
            setForm({ ...form, startsAt: event.target.value })
          }
          disabled={!canManage || !form.enabled}
          required={form.enabled}
        />
      </label>

      <label>
        Ends
        <input
          type="datetime-local"
          value={form.endsAt}
          onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
          disabled={!canManage || !form.enabled}
          required={form.enabled}
        />
      </label>

      {canManage ? (
        <button className="solid-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Apply"}
        </button>
      ) : null}
      {error ? (
        <p className="free-access-inline-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function toForm(policy: ReaderAccessPolicy): PolicyForm {
  return {
    enabled: policy.freeAccessEnabled,
    startsAt: toLocalInput(policy.freeAccessStartsAt),
    endsAt: toLocalInput(policy.freeAccessEndsAt),
  };
}

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function message(caught: unknown): string {
  return caught instanceof Error
    ? caught.message
    : "The request could not be completed.";
}
