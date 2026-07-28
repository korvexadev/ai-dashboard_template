import Link from "next/link";

import { Icon } from "@/components/icons/icon";

const modules = [
  {
    title: "Authentication",
    note: "Live",
    tone: "live",
  },
  {
    title: "Articles",
    note: "Live",
    tone: "live",
  },
  {
    title: "Media",
    note: "Planned",
    tone: "",
  },
  {
    title: "Audience",
    note: "Planned",
    tone: "",
  },
];

export default function OverviewPage() {
  return (
    <main className="overview">
      <div className="overview-heading">
        <div>
          <h2>Overview</h2>
          <p>Newsroom access, publishing tools, and system availability.</p>
        </div>
      </div>

      <section className="module-section" aria-labelledby="modules-heading">
        <div className="section-heading">
          <h3 id="modules-heading">Workspace status</h3>
          <p>Tools currently available to the newsroom team.</p>
        </div>
        <div className="module-strip">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <span className={`module-status ${module.tone}`}>
                {module.note}
              </span>
              <div>
                <h4>{module.title}</h4>
                <p>
                  {module.tone === "live"
                    ? "Available to authorized operators"
                    : "Scheduled for a later delivery phase"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="desk-grid">
        <article className="readiness-panel">
          <div className="panel-heading">
            <div>
              <h3>Newsroom readiness</h3>
              <p>Core services supporting the current article workflow.</p>
            </div>
            <span className="live-badge">Operational</span>
          </div>

          <div className="readiness-list">
            <div>
              <span className="check-mark">
                <Icon name="checkCircle" />
              </span>
              <span>
                <strong>Phone OTP</strong>
                <small>EFASHE delivery through the Mikozi backend</small>
              </span>
              <span className="row-state complete">Operational</span>
            </div>
            <div>
              <span className="check-mark">
                <Icon name="checkCircle" />
              </span>
              <span>
                <strong>Secure sessions</strong>
                <small>HttpOnly tokens with enforced refresh rotation</small>
              </span>
              <span className="row-state complete">Operational</span>
            </div>
            <div>
              <span className="check-mark">
                <Icon name="checkCircle" />
              </span>
              <span>
                <strong>Article drafts</strong>
                <small>Structured creation and authoritative reading</small>
              </span>
              <span className="row-state complete">Operational</span>
            </div>
          </div>
        </article>

        <aside className="desk-note">
          <div className="panel-heading">
            <div>
              <h3>Quick access</h3>
              <p>Continue with common newsroom tasks.</p>
            </div>
          </div>
          <div className="quick-links">
            <Link href="/articles/new">
              <span>
                <Icon name="plus" />
              </span>
              <span>
                <strong>Create article</strong>
                <small>Start a structured newsroom draft</small>
              </span>
              <Icon name="chevron" />
            </Link>
            <Link href="/articles">
              <span>
                <Icon name="articles" />
              </span>
              <span>
                <strong>Browse articles</strong>
                <small>Open current drafts and revisions</small>
              </span>
              <Icon name="chevron" />
            </Link>
            <Link href="/audit-logs">
              <span>
                <Icon name="activity" />
              </span>
              <span>
                <strong>Review activity</strong>
                <small>See recorded administrative actions</small>
              </span>
              <Icon name="chevron" />
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
