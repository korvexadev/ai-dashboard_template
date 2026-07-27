"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { Icon, type IconName } from "@/components/icons/icon";
import type { Profile } from "@/lib/api/contracts";

const navigation: Array<{ label: string; icon: IconName; available: boolean }> =
  [
    { label: "Overview", icon: "dashboard", available: true },
    { label: "Articles", icon: "articles", available: false },
    { label: "Media library", icon: "media", available: false },
    { label: "Audience", icon: "users", available: false },
  ];

interface DashboardShellProps {
  children: ReactNode;
  profile: Profile;
}

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const displayName = profile.displayName?.trim()
    ? profile.displayName
    : "Mikozi admin";
  const today = new Intl.DateTimeFormat("en-MW", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const saved = window.localStorage.getItem("mikozi:sidebar-expanded");
    if (saved === null) return;

    const hydration = window.setTimeout(
      () => setSidebarExpanded(saved === "true"),
      0,
    );
    return () => window.clearTimeout(hydration);
  }, []);

  function toggleSidebar() {
    setSidebarExpanded((current) => {
      window.localStorage.setItem("mikozi:sidebar-expanded", String(!current));
      return !current;
    });
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/auth");
      router.refresh();
    }
  }

  return (
    <div
      className={`dashboard-frame ${sidebarExpanded ? "" : "sidebar-collapsed"}`}
    >
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand-row">
          <Link
            className="dashboard-brand"
            href="/"
            aria-label="Mikozi overview"
          >
            <BrandMark />
            <span>Mikozi</span>
          </Link>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-expanded={sidebarExpanded}
            aria-label={
              sidebarExpanded ? "Collapse navigation" : "Expand navigation"
            }
            title={
              sidebarExpanded ? "Collapse navigation" : "Expand navigation"
            }
          >
            <Icon name={sidebarExpanded ? "panelClose" : "panelOpen"} />
          </button>
        </div>

        <nav aria-label="Primary navigation">
          <p className="nav-label">Newsroom</p>
          <ul>
            {navigation.map((item) => (
              <li key={item.label}>
                <Link
                  className={item.available ? "active" : "coming-soon"}
                  href={item.available ? "/" : "#"}
                  aria-disabled={!item.available}
                  tabIndex={item.available ? undefined : -1}
                  onClick={
                    item.available
                      ? undefined
                      : (event) => event.preventDefault()
                  }
                  title={
                    item.available ? undefined : "Coming in a later module"
                  }
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {!item.available ? <small>Soon</small> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          <a className="settings-link" aria-disabled="true">
            <Icon name="settings" />
            <span>Settings</span>
          </a>
          <div className="profile-card">
            <span className="profile-avatar">{initials}</span>
            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>{formatRole(profile.adminAccess?.role)}</small>
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <div className="dashboard-workspace">
        <header className="workspace-header">
          <div>
            <p>{today}</p>
            <h1>Good day, {firstName(displayName)}.</h1>
          </div>
          <div className="header-actions">
            <button type="button" aria-label="Search" disabled>
              <Icon name="search" />
            </button>
            <button type="button" aria-label="Notifications" disabled>
              <Icon name="bell" />
            </button>
            <button className="create-button" type="button" disabled>
              <Icon name="plus" /> <span>Create article</span>
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function formatRole(role?: string): string {
  if (!role) return "Administrator";
  return role
    .split("_")
    .map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
