import { useEffect, useState } from 'react';
import { formatTimestamp } from '../utils/format';
import { SECTION_ORDER, SECTION_LABELS, parseSections, extractThreatLevel, truncate, cleanText, hostnameOf, URL_REGEX } from '../utils/intelReport';

// Renders cleaned section text, turning any remaining bare URLs into
// clickable links shown as their hostname (full URLs are too long for prose).
function renderSectionText(text) {
  const parts = cleanText(text).split(URL_REGEX);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="intel-inline-link">
        {hostnameOf(part)}
      </a>
    ) : (
      part
    )
  );
}

export default function IntelReport({ data }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const sections = parseSections(data.report);
  const categories = data.categories || [];
  const sourcesByLabel = Object.fromEntries(
    categories.map((c) => [c.label, c.results || []])
  );
  const threatLevel = extractThreatLevel(sections['THREAT LEVEL']);

  return (
    <div className={`intel-report${visible ? ' fade-in' : ' invisible'}`}>
      <div className="intel-report-meta-row">
        {threatLevel && (
          <span className={`intel-threat-badge intel-threat-badge--${threatLevel.toLowerCase()}`}>
            Threat: {threatLevel}
          </span>
        )}
        <span className="intel-report-timestamp">{formatTimestamp(data.created_at)}</span>
        {typeof data.elapsed_seconds === 'number' && (
          <span className="intel-report-elapsed">Analyzed in {data.elapsed_seconds}s</span>
        )}
      </div>

      <div className="intel-report-sections">
        {SECTION_ORDER.filter((key) => key !== 'THREAT LEVEL').map((key) => {
          const content = sections[key];
          if (!content) return null;

          const sources = sourcesByLabel[key] || [];

          return (
            <div
              key={key}
              className={`intel-section${key === 'STRATEGIC TAKE' ? ' intel-section--strategic' : ''}`}
            >
              <span className="intel-section-label">{SECTION_LABELS[key]}</span>
              <p className="intel-section-text">{renderSectionText(content)}</p>

              {sources.length > 0 && (
                <ul className="intel-section-sources">
                  {sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="intel-section-source-link"
                      >
                        {truncate(s.title, 70)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
