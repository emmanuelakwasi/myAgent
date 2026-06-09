import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RECENT_ACTIVITY = [
  { label: 'AI funding rounds 2026',        ago: '2m ago' },
  { label: 'Apple WWDC announcements',       ago: '7m ago' },
  { label: 'Competitor watch: Notion AI',    ago: '14m ago' },
  { label: 'Open-source LLM releases',       ago: '21m ago' },
  { label: 'YCombinator W26 batch',          ago: '35m ago' },
  { label: 'Autonomous agent frameworks',    ago: '48m ago' },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time web monitoring',
    desc: 'Watches any topic across news, blogs, and live search results.',
  },
  {
    icon: '🧠',
    title: 'AI-generated briefings',
    desc: "Surfaces what's new, what matters, and what's noise — every run.",
  },
  {
    icon: '📌',
    title: 'Track anything',
    desc: 'Competitors, research areas, markets, people, keywords.',
  },
];

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('userId');
    if (saved) navigate(`/dashboard/${saved}`, { replace: true });
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email to get started.');
      return;
    }
    localStorage.setItem('userId', trimmed);
    navigate(`/dashboard/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="ob-wrapper">
      <div className="ob-layout">

        {/* ── Left: value prop ── */}
        <div className="ob-left">
          <div className="ob-brand">
            <span className="live-dot" aria-hidden="true" />
            <span className="ob-brand-name">
              myagent<span className="accent">.fyi</span>
            </span>
          </div>

          <div className="ob-hero">
            <h1 className="ob-hero-title">
              Your AI agent,<br />always watching.
            </h1>
            <p className="ob-hero-sub">
              Add any topic. The agent scans the web and delivers a structured
              briefing — every time you need it.
            </p>
          </div>

          <ul className="ob-features">
            {FEATURES.map((f) => (
              <li key={f.title} className="ob-feature-item">
                <span className="ob-feature-icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <p className="ob-feature-title">{f.title}</p>
                  <p className="ob-feature-desc">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="ob-ticker">
            <p className="ob-ticker-label">Recent agent activity</p>
            <ul className="ob-ticker-list">
              {RECENT_ACTIVITY.map((item, i) => (
                <li key={i} className="ob-ticker-row">
                  <span className="ob-ticker-dot" aria-hidden="true" />
                  <span className="ob-ticker-topic">{item.label}</span>
                  <span className="ob-ticker-meta">{item.ago}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="ob-right">
          <div className="ob-form-card">
            <div>
              <h2 className="ob-form-heading">Start monitoring</h2>
              <p className="ob-form-sub">
                Enter your email to save your topics between sessions.
              </p>
            </div>

            <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
              <label className="onboarding-label" htmlFor="email-input">
                Email address
              </label>
              <input
                id="email-input"
                className={`onboarding-input${error ? ' onboarding-input--error' : ''}`}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
              />
              {error && <p className="onboarding-error">{error}</p>}
              <button className="onboarding-button" type="submit">
                Activate my agent →
              </button>
            </form>

            <p className="ob-form-note">
              No password. Your topics are stored to your email address.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
