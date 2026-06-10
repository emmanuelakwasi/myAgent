import { useEffect, useState } from 'react';
import { getTimeline } from '../services/api';
import { getThreatSeverity, THREAT_COLORS } from '../utils/intelReport';

const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// viewBox geometry: plot area spans y=15 (CRITICAL) to y=105 (LOW),
// with date labels placed below at y=130.
const VB_WIDTH = 320;
const VB_HEIGHT = 140;
const PAD_X = 20;
const PLOT_TOP = 15;
const PLOT_HEIGHT = 90;

function shortDate(isoString) {
  return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ThreatTimeline({ companyName, userId }) {
  const [points, setPoints] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    setPoints(null);
    getTimeline(companyName, userId)
      .then((entries) => {
        if (cancelled) return;
        const valid = entries
          .map((e) => ({
            id: e.id,
            created_at: e.created_at,
            severity: getThreatSeverity(e.report),
          }))
          .filter((e) => e.severity != null);
        setPoints(valid);
      })
      .catch(() => {
        if (!cancelled) setPoints([]);
      });
    return () => { cancelled = true; };
  }, [companyName, userId]);

  if (points === null) return null;

  if (points.length < 2) {
    return (
      <div className="threat-timeline">
        <span className="threat-timeline-label">Threat level over time</span>
        <p className="threat-timeline-empty">
          Track <strong>{companyName}</strong> over time — analyze it again later to see how its threat level changes.
        </p>
      </div>
    );
  }

  const step = (VB_WIDTH - PAD_X * 2) / (points.length - 1);
  const coords = points.map((p, i) => ({
    ...p,
    x: PAD_X + i * step,
    y: PLOT_TOP + (3 - p.severity) * (PLOT_HEIGHT / 3),
  }));

  const polylinePoints = coords.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="threat-timeline">
      <span className="threat-timeline-label">Threat level over time</span>
      <svg className="threat-timeline-svg" viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`} preserveAspectRatio="none">
        <polyline points={polylinePoints} className="threat-timeline-line" />
        {coords.map((p) => (
          <circle key={p.id ?? p.created_at} cx={p.x} cy={p.y} r="4" fill={THREAT_COLORS[SEVERITY_LEVELS[p.severity]]}>
            <title>{`${shortDate(p.created_at)} — ${SEVERITY_LEVELS[p.severity]}`}</title>
          </circle>
        ))}
        {coords.map((p) => (
          <text key={`label-${p.id ?? p.created_at}`} x={p.x} y="130" className="threat-timeline-date" textAnchor="middle">
            {shortDate(p.created_at)}
          </text>
        ))}
      </svg>
    </div>
  );
}
