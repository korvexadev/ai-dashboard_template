"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { Icon, type IconName } from "@/components/icons/icon";
import type { Profile } from "@/lib/api/contracts";

const navigation: Array<{
  label: string;
  icon: IconName;
  href: string;
  available: boolean;
  superAdminOnly?: boolean;
}> = [
  { label: "Overview", icon: "dashboard", href: "/", available: true },
  { label: "Articles", icon: "articles", href: "/articles", available: true },
  {
    label: "Mobile homepage",
    icon: "dashboard",
    href: "/homepage",
    available: true,
  },
  { label: "Audience", icon: "users", href: "/audience", available: true },
  {
    label: "Subscriptions",
    icon: "bell",
    href: "/subscriptions",
    available: true,
  },
  { label: "Transactions", icon: "advert", href: "#", available: false },
  {
    label: "Media library",
    icon: "media",
    href: "/media-library",
    available: true,
  },
  {
    label: "Notifications",
    icon: "bell",
    href: "/notifications",
    available: true,
  },
  {
    label: "Dashboard users",
    icon: "settings",
    href: "/users",
    available: true,
    superAdminOnly: true,
  },
  {
    label: "Activity log",
    icon: "activity",
    href: "/audit-logs",
    available: true,
    superAdminOnly: true,
  },
];

interface DashboardShellProps {
  children: ReactNode;
  profile: Profile;
}

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
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
            {navigation
              .filter(
                (item) =>
                  !item.superAdminOnly ||
                  profile.adminAccess?.role === "super_admin",
              )
              .map((item) => (
                <li key={item.label}>
                  <Link
                    className={
                      item.available
                        ? isActive(pathname, item.href)
                          ? "active"
                          : undefined
                        : "coming-soon"
                    }
                    href={item.href}
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
            <Link className="create-button" href="/articles/new">
              <Icon name="plus" /> <span>Create article</span>
            </Link>
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

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}
