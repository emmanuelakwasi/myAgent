import { useEffect, useState } from 'react';

// We split on section headers because the Claude system prompt guarantees this
// format. If the format ever changes, this parser breaks — that's intentional
// coupling, and it means we should be careful if we ever edit the system prompt.
function parseSections(text) {
  if (!text) return { "WHAT'S NEW": '', 'WHAT MATTERS': '', NOISE: '' };

  const regex = /(WHAT'S NEW|WHAT MATTERS|NOISE)\s*[—\-]\s*/;
  const parts = text.split(regex);
  const sections = { "WHAT'S NEW": '', 'WHAT MATTERS': '', NOISE: '' };

  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i];
    if (key in sections) {
      sections[key] = parts[i + 1] ? parts[i + 1].trim() : '';
    }
  }
  return sections;
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) return `Today at ${timeStr}`;

  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr} at ${timeStr}`;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

const SECTION_CONFIG = [
  { key: "WHAT'S NEW",   className: 'briefing-section--new' },
  { key: 'WHAT MATTERS', className: 'briefing-section--matters' },
  { key: 'NOISE',        className: 'briefing-section--noise' },
];

export default function BriefingCard({ briefing }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const sections = parseSections(briefing.summary);
  const results = briefing.results || [];

  return (
    <div className={`briefing-card${visible ? ' fade-in' : ' invisible'}`}>
      <div className="briefing-sections">
        {SECTION_CONFIG.map(({ key, className }) =>
          sections[key] ? (
            <div key={key} className={`briefing-section ${className}`}>
              <span className="briefing-section-label">{key}</span>
              <p className="briefing-section-text">{sections[key]}</p>
            </div>
          ) : null
        )}
      </div>

      {results.length > 0 && (
        <div className="briefing-sources">
          <span className="briefing-sources-label">Sources</span>
          <ul className="briefing-source-list">
            {results.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url || r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="briefing-source-link"
                >
                  {truncate(r.title, 60)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="briefing-footer">
        <span className="briefing-timestamp">
          {formatTimestamp(briefing.created_at)}
        </span>
      </div>
    </div>
  );
}
