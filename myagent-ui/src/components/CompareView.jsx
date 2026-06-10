import IntelReport from './IntelReport';
import { parseSections, extractThreatLevel, THREAT_SEVERITY } from '../utils/intelReport';

function getThreat(report) {
  const sections = parseSections(report);
  return extractThreatLevel(sections['THREAT LEVEL']);
}

export default function CompareView({ result }) {
  const { a, b, verdict } = result;

  const threatA = getThreat(a.report);
  const threatB = getThreat(b.report);

  let biggerThreat = null;
  if (threatA && threatB) {
    const sevA = THREAT_SEVERITY[threatA];
    const sevB = THREAT_SEVERITY[threatB];
    if (sevA > sevB) biggerThreat = 'a';
    else if (sevB > sevA) biggerThreat = 'b';
  }

  return (
    <div className="compare-view">
      {verdict && (
        <div className="compare-verdict">
          <span className="compare-verdict-label">Head-to-Head Verdict</span>
          <p className="compare-verdict-text">{verdict}</p>
        </div>
      )}

      <div className="compare-grid">
        <div className="compare-column">
          <div className="compare-column-header">
            <h2 className="compare-column-title">{a.company_name}</h2>
            {biggerThreat === 'a' && <span className="compare-threat-tag">Bigger threat</span>}
          </div>
          <IntelReport data={a} />
        </div>

        <div className="compare-divider" aria-hidden="true">VS</div>

        <div className="compare-column">
          <div className="compare-column-header">
            <h2 className="compare-column-title">{b.company_name}</h2>
            {biggerThreat === 'b' && <span className="compare-threat-tag">Bigger threat</span>}
          </div>
          <IntelReport data={b} />
        </div>
      </div>
    </div>
  );
}
