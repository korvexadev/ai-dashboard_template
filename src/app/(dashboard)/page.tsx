import { Icon } from "@/components/icons/icon";

const modules = [
  {
    number: "01",
    title: "Authentication",
    note: "Live",
    tone: "live",
  },
  {
    number: "02",
    title: "Articles",
    note: "Next",
    tone: "next",
  },
  {
    number: "03",
    title: "Media",
    note: "Queued",
    tone: "",
  },
  {
    number: "04",
    title: "Audience",
    note: "Queued",
    tone: "",
  },
];

export default function OverviewPage() {
  return (
    <main className="overview">
      <section className="module-strip" aria-label="Delivery progress">
        {modules.map((module) => (
          <article className="module-card" key={module.number}>
            <div>
              <span>{module.number}</span>
              <span className={`module-status ${module.tone}`}>
                {module.note}
              </span>
            </div>
            <h2>{module.title}</h2>
          </article>
        ))}
      </section>

      <section className="desk-grid">
        <article className="readiness-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Workspace readiness</p>
              <h2>The foundation is in place.</h2>
            </div>
            <span className="live-badge">
              <i /> Auth live
            </span>
          </div>
          <p className="panel-intro">
            The newsroom now has secure phone sign-in, protected routes and
            automatic session renewal. Editorial data will appear here as each
            backend module is delivered.
          </p>

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
              <span className="queue-mark">
                <Icon name="clock" />
              </span>
              <span>
                <strong>Editorial workflow</strong>
                <small>
                  Drafting, review and publishing are the next module
                </small>
              </span>
              <span className="row-state">Up next</span>
            </div>
          </div>
        </article>

        <aside className="desk-note">
          <div className="desk-note-heading">
            <span>
              <Icon name="articles" />
            </span>
            <div>
              <p className="eyebrow">Next module</p>
              <h2>Articles workspace</h2>
            </div>
          </div>
          <p className="desk-note-intro">
            The editorial workflow will arrive as one connected backend and
            dashboard slice.
          </p>
          <div className="desk-note-list">
            <div>
              <span>01</span>
              <strong>Draft model</strong>
              <small>Planned</small>
            </div>
            <div>
              <span>02</span>
              <strong>Review permissions</strong>
              <small>Planned</small>
            </div>
            <div>
              <span>03</span>
              <strong>Publishing workflow</strong>
              <small>Planned</small>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
