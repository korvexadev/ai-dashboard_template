"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  deleteDashboardUser,
  listDashboardUsers,
  provisionDashboardUser,
  updateDashboardUserStatus,
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
  const [accountAction, setAccountAction] = useState<{
    readerId: string;
    kind: "status" | "delete";
  }>();
  const [confirmAction, setConfirmAction] = useState<{
    user: DashboardUser;
    kind: "disable" | "delete";
  }>();

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

  async function changeStatus(
    user: DashboardUser,
    status: "active" | "disabled",
  ) {
    setConfirmAction(undefined);
    setAccountAction({ readerId: user.readerId, kind: "status" });
    setError(undefined);
    try {
      await updateDashboardUserStatus(user.readerId, status);
      setCollection((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.readerId === user.readerId ? { ...item, status } : item,
              ),
            }
          : current,
      );
    } catch (caught: unknown) {
      setError(message(caught, "The account status could not be changed."));
    } finally {
      setAccountAction(undefined);
    }
  }

  async function remove(user: DashboardUser) {
    setConfirmAction(undefined);
    setAccountAction({ readerId: user.readerId, kind: "delete" });
    setError(undefined);
    try {
      await deleteDashboardUser(user.readerId);
      setCollection((current) =>
        current
          ? {
              items: current.items.filter(
                (item) => item.readerId !== user.readerId,
              ),
              total: Math.max(0, current.total - 1),
            }
          : current,
      );
    } catch (caught: unknown) {
      setError(message(caught, "The account could not be deleted."));
    } finally {
      setAccountAction(undefined);
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
              <strong>
                {collection
                  ? "Access could not be updated."
                  : "Dashboard users could not be loaded."}
              </strong>
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
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
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
                    <td className="dashboard-user-actions">
                      {user.canManage ? (
                        <>
                          <button
                            type="button"
                            disabled={accountAction?.readerId === user.readerId}
                            onClick={() =>
                              user.status === "active"
                                ? setConfirmAction({ user, kind: "disable" })
                                : void changeStatus(user, "active")
                            }
                          >
                            <Icon
                              name={
                                user.status === "active"
                                  ? "users"
                                  : "checkCircle"
                              }
                            />
                            {accountAction?.readerId === user.readerId &&
                            accountAction.kind === "status"
                              ? "Updating…"
                              : user.status === "active"
                                ? "Disable"
                                : "Enable"}
                          </button>
                          <button
                            className="dashboard-user-delete"
                            type="button"
                            disabled={accountAction?.readerId === user.readerId}
                            onClick={() =>
                              setConfirmAction({ user, kind: "delete" })
                            }
                            aria-label={`Delete ${user.displayName ?? user.phoneNumber}`}
                          >
                            <Icon name="trash" />
                            {accountAction?.readerId === user.readerId &&
                            accountAction.kind === "delete"
                              ? "Deleting…"
                              : "Delete"}
                          </button>
                        </>
                      ) : (
                        <span className="protected-account">Protected</span>
                      )}
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
      {confirmAction ? (
        <div className="reader-confirm-overlay">
          <section
            className="reader-confirm-dialog dashboard-user-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-user-confirm-heading"
          >
            <span className="reader-confirm-icon">
              <Icon
                name={confirmAction.kind === "delete" ? "trash" : "users"}
              />
            </span>
            <h2 id="dashboard-user-confirm-heading">
              {confirmAction.kind === "delete"
                ? "Delete account?"
                : "Disable account?"}
            </h2>
            <p>
              {confirmAction.user.displayName ??
                `+${confirmAction.user.phoneNumber}`}
            </p>
            <small>
              {confirmAction.kind === "delete"
                ? "Access ends immediately. Historical activity is retained."
                : "All active sessions will be signed out."}
            </small>
            <div>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmAction(undefined)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                type="button"
                onClick={() =>
                  confirmAction.kind === "delete"
                    ? void remove(confirmAction.user)
                    : void changeStatus(confirmAction.user, "disabled")
                }
              >
                {confirmAction.kind === "delete" ? "Delete" : "Disable"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
