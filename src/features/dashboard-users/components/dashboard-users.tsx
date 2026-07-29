"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  listDashboardUsers,
  provisionDashboardUser,
} from "@/features/dashboard-users/api/dashboard-users";
import type {
  DashboardUser,
  DashboardUserCollection,
} from "@/lib/api/contracts";

export function DashboardUsers() {
  const [collection, setCollection] = useState<DashboardUserCollection>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCollection(await listDashboardUsers());
      setError(undefined);
    } catch (caught: unknown) {
      setError(message(caught, "Dashboard users could not be loaded."));
    }
  }, []);

  useEffect(() => {
    let active = true;
    void listDashboardUsers()
      .then((result) => {
        if (active) setCollection(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(message(caught, "Dashboard users could not be loaded."));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const user = await provisionDashboardUser({
        phoneNumber,
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
      });
      setCollection((current) => upsert(current, user));
      setPhoneNumber("");
      setDisplayName("");
    } catch (caught: unknown) {
      setError(message(caught, "The dashboard user could not be added."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="article-workspace dashboard-users-page">
      <div className="page-title-row">
        <div>
          <h2>Dashboard users</h2>
          <p>Operators, roles and access.</p>
        </div>
      </div>

      <section className="dashboard-users-layout">
        <form className="provision-card" onSubmit={submit}>
          <div className="provision-icon">
            <Icon name="users" />
          </div>
          <div>
            <h3>Add operator</h3>
          </div>

          <label>
            Phone number
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0991 234 567"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              maxLength={24}
              required
            />
          </label>
          <label>
            Display name <small>Optional</small>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Chikondi Banda"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
            />
          </label>
          <button className="solid-button" type="submit" disabled={saving}>
            <Icon name="plus" />
            {saving ? "Adding…" : "Add operator"}
          </button>
        </form>

        <section className="dashboard-users-panel">
          <header>
            <div className="articles-library-title">
              <h3>Dashboard access</h3>
              <p>
                {collection
                  ? `${collection.total} ${collection.total === 1 ? "operator" : "operators"}`
                  : "Loading…"}
              </p>
            </div>
            <button
              className="outline-button refresh-button"
              type="button"
              onClick={() => void load()}
            >
              <Icon name="activity" />
              Refresh
            </button>
          </header>

          {error ? (
            <div className="dashboard-users-error" role="alert">
              <strong>Access could not be updated.</strong>
              <p>{error}</p>
            </div>
          ) : null}

          <div className="dashboard-users-table-wrap">
            <table className="dashboard-users-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Added</th>
                </tr>
              </thead>
              <tbody>
                {collection?.items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="user-initials">
                        {initials(user.displayName, user.phoneNumber)}
                      </span>
                      <span>
                        <strong>{user.displayName ?? "Unnamed user"}</strong>
                        <small>+{user.phoneNumber}</small>
                      </span>
                    </td>
                    <td data-label="Role">
                      <span className={`role-pill ${user.role}`}>
                        {user.role === "super_admin" ? "Super admin" : "Admin"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={user.status} />
                    </td>
                    <td data-label="Added">
                      <time dateTime={user.createdAt}>
                        {formatDate(user.createdAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {collection?.items.length === 0 ? (
            <div className="list-state">
              <Icon name="users" />
              <h3>No dashboard users</h3>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function upsert(
  current: DashboardUserCollection | undefined,
  user: DashboardUser,
): DashboardUserCollection {
  if (!current) return { items: [user], total: 1 };
  const exists = current.items.some((item) => item.id === user.id);
  return {
    items: [user, ...current.items.filter((item) => item.id !== user.id)],
    total: exists ? current.total : current.total + 1,
  };
}

function initials(name: string | null, phone: string): string {
  if (!name) return phone.slice(-2);
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function message(caught: unknown, fallback: string): string {
  return caught instanceof Error ? caught.message : fallback;
}
