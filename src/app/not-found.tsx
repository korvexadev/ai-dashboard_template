import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { Icon } from "@/components/icons/icon";

const nav = [
  { label: "Overview", icon: "dashboard" as const },
  { label: "Articles", icon: "articles" as const },
  { label: "Media library", icon: "media" as const },
  { label: "Audience", icon: "users" as const },
];

export default function NotFound() {
  return (
    <main className="not-found-dashboard">
      <aside className="not-found-sidebar" aria-label="Newsroom navigation">
        <Link href="/" className="not-found-logo" aria-label="Mikozi newsroom">
          <BrandMark />
        </Link>
        <nav>
          {nav.map((item) => (
            <span key={item.label} title={item.label}>
              <Icon name={item.icon} />
            </span>
          ))}
        </nav>
        <span className="not-found-avatar">MN</span>
      </aside>

      <section className="not-found-workspace">
        <header className="not-found-topbar">
          <div>
            <span>Mikozi</span>
            <Icon name="chevron" />
            <strong>Page unavailable</strong>
          </div>
          <Link href="/">Newsroom overview</Link>
        </header>

        <div className="not-found-stage">
          <article className="not-found-panel">
            <div className="not-found-visual" aria-hidden="true">
              <span>404</span>
              <i>
                <Icon name="articles" />
              </i>
            </div>
            <p className="not-found-kicker">Page not found</p>
            <h1>This page isn’t in the newsroom.</h1>
            <p>
              The address may be incomplete, or this workspace has moved to a
              different location.
            </p>
            <Link href="/" className="not-found-action">
              Return to overview
              <Icon name="arrowRight" />
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
