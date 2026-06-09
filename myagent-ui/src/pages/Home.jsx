import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TERMINAL_LINES = [
  { type: 'dim',   text: '$ myagent scan --topic "AI chip regulation 2026"' },
  { type: 'green', text: '✓  Querying live web sources...' },
  { type: 'dim',   text: '   8 results returned in 2.3s' },
  { type: 'green', text: '✓  Running Llama 3.3 analysis...' },
  { type: 'blue',  text: '   WHAT\'S NEW — EU passed new AI chip export' },
  { type: 'blue',  text: '   controls targeting sub-3nm nodes on June 4.' },
  { type: 'amber', text: '   WHAT MATTERS — TSMC & ASML dropped 3.2%.' },
  { type: 'amber', text: '   Analysts flag Q3 supply risk for EU clusters.' },
  { type: 'muted', text: '   NOISE — Blogs recycling Q1 2025 US ban data.' },
  { type: 'green', text: '✓  Briefing saved.  Next run in 6h.' },
];

const STEPS = [
  { num: '01', title: 'Add a topic', desc: 'A keyword, competitor, market — anything. Takes five seconds.' },
  { num: '02', title: 'Agent scans', desc: 'Searches live web sources in real time. No cached data.' },
  { num: '03', title: 'Read the briefing', desc: "Signal separated from noise. What's new, what matters, done." },
];

const FEATURES = [
  { icon: '⚡', tag: 'LIVE DATA',     title: 'Real-time SERP monitoring', desc: 'Powered by Nimble SERP with Google News fallback. Fresh results every scan.' },
  { icon: '🧠', tag: 'AI ANALYSIS',   title: 'Signal over noise',         desc: 'Llama 3.3 reads every source and writes a structured three-part briefing — not a wall of text.' },
  { icon: '🎯', tag: 'FLEXIBLE',      title: 'Track anything',            desc: 'Competitors, regulations, research, markets. Any topic in any industry.' },
];

export default function Home() {
  const navigate = useNavigate();
  const demoRef = useRef(null);

  function scrollToDemo() {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function goStart() {
    navigate('/start');
  }

  return (
    <div className="hp-root">

      {/* ── Nav ─────────────────────────────────── */}
      <nav className="hp-nav">
        <span className="hp-nav-brand">
          <span className="live-dot" aria-hidden="true" />
          myagent<span className="accent">.fyi</span>
        </span>
        <div className="hp-nav-right">
          <button className="hp-nav-link" onClick={scrollToDemo}>See demo</button>
          <button className="hp-nav-cta" onClick={goStart}>Get started →</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-left">
          <div className="hp-hero-badge">
            <span className="live-dot" style={{ width: 7, height: 7, marginRight: 8 }} aria-hidden="true" />
            Autonomous web intelligence
          </div>
          <h1 className="hp-hero-title">
            Stop checking<br />
            the news.<br />
            <span className="accent">Let your agent.</span>
          </h1>
          <p className="hp-hero-sub">
            Add any topic. Your agent scans the live web, runs AI analysis,
            and surfaces exactly what changed — what's new, what matters,
            and what's just noise.
          </p>
          <div className="hp-hero-actions">
            <button className="hp-btn-primary" onClick={goStart}>
              Activate my agent →
            </button>
            <button className="hp-btn-ghost" onClick={scrollToDemo}>
              See it in action
            </button>
          </div>
        </div>

        <div className="hp-hero-right">
          <div className="hp-terminal">
            <div className="hp-terminal-bar">
              <span className="hp-terminal-dot hp-dot-red"   aria-hidden="true" />
              <span className="hp-terminal-dot hp-dot-amber" aria-hidden="true" />
              <span className="hp-terminal-dot hp-dot-green" aria-hidden="true" />
              <span className="hp-terminal-title">myagent — live scan</span>
            </div>
            <div className="hp-terminal-body">
              {TERMINAL_LINES.map((line, i) => (
                <p
                  key={i}
                  className={`hp-t-line hp-t-line--${line.type}`}
                  style={{ animationDelay: `${0.4 + i * 0.2}s` }}
                >
                  {line.text}
                </p>
              ))}
              <span
                className="hp-cursor"
                style={{ animationDelay: `${0.4 + TERMINAL_LINES.length * 0.2 + 0.1}s` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────── */}
      <div className="hp-stats-bar">
        {[
          { val: '12,400+', label: 'Topics monitored' },
          { val: '340K',    label: 'Briefings generated' },
          { val: '< 45s',   label: 'Avg scan time' },
          { val: '3 LLMs',  label: 'Tried before Groq' },
        ].map((s, i) => (
          <div key={s.label} className="hp-stat-wrap">
            {i > 0 && <span className="hp-stat-divider" aria-hidden="true" />}
            <div className="hp-stat">
              <span className="hp-stat-val">{s.val}</span>
              <span className="hp-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── How it works ────────────────────────── */}
      <section className="hp-section">
        <p className="hp-section-eyebrow">HOW IT WORKS</p>
        <h2 className="hp-section-title">Three steps. No setup.</h2>
        <div className="hp-steps">
          {STEPS.map((s, i) => (
            <div key={s.num} className="hp-step-wrap">
              <div className="hp-step">
                <span className="hp-step-num">{s.num}</span>
                <h3 className="hp-step-title">{s.title}</h3>
                <p className="hp-step-desc">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <span className="hp-step-arrow" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────── */}
      <section className="hp-section hp-section--alt">
        <p className="hp-section-eyebrow">CAPABILITIES</p>
        <h2 className="hp-section-title">Built for signal, not noise.</h2>
        <div className="hp-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="hp-feature-card">
              <div className="hp-feature-tag">{f.tag}</div>
              <div className="hp-feature-icon">{f.icon}</div>
              <h3 className="hp-feature-title">{f.title}</h3>
              <p className="hp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live briefing preview ────────────────── */}
      <section className="hp-section" ref={demoRef} id="demo">
        <p className="hp-section-eyebrow">SAMPLE OUTPUT</p>
        <h2 className="hp-section-title">This is what a briefing looks like.</h2>
        <p className="hp-section-sub">Real output from the agent. No cherry-picking.</p>

        <div className="hp-demo-card">
          <div className="hp-demo-header">
            <div>
              <p className="hp-demo-topic">AI chip regulation 2026</p>
              <code className="hp-demo-query">ai chip export controls EU 2026</code>
            </div>
            <span className="hp-demo-badge">
              <span className="live-dot" style={{ width: 6, height: 6, marginRight: 6 }} aria-hidden="true" />
              Live output
            </span>
          </div>
          <div className="hp-demo-sections">
            <div className="hp-demo-block hp-demo-block--new">
              <span className="hp-demo-block-label">WHAT'S NEW</span>
              <p>The EU passed new AI chip export controls targeting sub-3nm nodes on June 4, 2026. TSMC confirmed it will apply for exemptions covering R&amp;D shipments to European partners before the July 1 enforcement date.</p>
            </div>
            <div className="hp-demo-block hp-demo-block--matters">
              <span className="hp-demo-block-label">WHAT MATTERS</span>
              <p>TSMC and ASML shares dropped 3.2% on the news. Analysts flag Q3 supply risk for GPU clusters in European data centers — datacenter buildouts may slip 6–8 weeks.</p>
            </div>
            <div className="hp-demo-block hp-demo-block--noise">
              <span className="hp-demo-block-label">NOISE</span>
              <p>Several blogs are recycling Q1 2025 analysis of US chip bans — unrelated to the June 2026 EU policy change.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────── */}
      <section className="hp-cta">
        <div className="hp-cta-glow" aria-hidden="true" />
        <p className="hp-cta-eyebrow">GET STARTED</p>
        <h2 className="hp-cta-title">
          Ready to stop missing<br />what matters?
        </h2>
        <p className="hp-cta-sub">
          Free. No credit card. Your first briefing in under a minute.
        </p>
        <button className="hp-btn-primary hp-btn-lg" onClick={goStart}>
          Activate your agent →
        </button>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="hp-footer">
        <span className="hp-footer-brand">
          myagent<span className="accent">.fyi</span>
        </span>
        <span className="hp-footer-copy">
          Built for the 2026 hackathon · Powered by Groq + Nimble
        </span>
      </footer>

    </div>
  );
}
