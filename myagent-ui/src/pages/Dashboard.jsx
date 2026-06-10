import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyzeCompany, getHistory, compareCompanies } from '../services/api';
import IntelReport from '../components/IntelReport';
import CompareView from '../components/CompareView';
import ThreatTimeline from '../components/ThreatTimeline';
import { formatTimestamp } from '../utils/format';

export default function Dashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [view, setView] = useState('search'); // 'search' | 'report' | 'compare'
  const [companyName, setCompanyName] = useState('');
  const [context, setContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const [companyA, setCompanyA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    document.title = 'myagent.fyi';
  }, []);

  useEffect(() => {
    getHistory(userId)
      .then((data) => setHistory(data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [userId]);

  async function handleAnalyze(e) {
    e.preventDefault();
    const name = companyName.trim();
    if (!name || analyzing) return;

    setAnalyzing(true);
    setError('');

    try {
      const data = await analyzeCompany(name, userId, context.trim());
      setActiveReport(data);
      setHistory((prev) => [
        {
          id: data.id,
          company_name: data.company_name,
          created_at: data.created_at,
          elapsed_seconds: data.elapsed_seconds,
          report: data.report,
        },
        ...prev,
      ]);
      setView('report');
    } catch {
      setError('Something went wrong. Check your API keys and try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCompare(e) {
    e.preventDefault();
    const a = companyA.trim();
    const b = companyB.trim();
    if (!a || !b || comparing) return;

    setComparing(true);
    setCompareError('');

    try {
      const data = await compareCompanies(a, b, userId);
      setCompareResult(data);
      setHistory((prev) => [
        {
          id: data.a.id,
          company_name: data.a.company_name,
          created_at: data.a.created_at,
          elapsed_seconds: data.a.elapsed_seconds,
          report: data.a.report,
        },
        {
          id: data.b.id,
          company_name: data.b.company_name,
          created_at: data.b.created_at,
          elapsed_seconds: data.b.elapsed_seconds,
          report: data.b.report,
        },
        ...prev,
      ]);
    } catch {
      setCompareError('Something went wrong. Check your API keys and try again.');
    } finally {
      setComparing(false);
    }
  }

  function openHistoryItem(item) {
    setActiveReport(item);
    setView('report');
  }

  function backToSearch() {
    setView('search');
    setActiveReport(null);
    setCompanyName('');
    setContext('');
    setError('');
    setCopied(false);
    setCompanyA('');
    setCompanyB('');
    setCompareError('');
    setCompareResult(null);
  }

  function handleShare() {
    if (!activeReport?.id) return;
    const url = `${window.location.origin}/r/${activeReport.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogout() {
    localStorage.removeItem('userId');
    navigate('/');
  }

  const showNewSearch = view === 'report' || (view === 'compare' && compareResult);

  return (
    <div className="dashboard">
      <header className="topbar">
        <button className="topbar-brand" onClick={() => navigate('/')}>
          myagent<span className="accent">.fyi</span>
        </button>
        <div className="topbar-right">
          <span className="topbar-user">{userId}</span>
          {showNewSearch && (
            <button className="btn-primary btn-sm" onClick={backToSearch}>
              + New search
            </button>
          )}
          <button className="topbar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {view === 'search' && (
          <div className="intel-search">
            <div className="intel-search-hero">
              <h1 className="intel-search-title">
                Know your <span className="accent">competition</span>.
              </h1>
              <p className="intel-search-sub">
                Enter a company name. Your agent pulls reputation, product,
                growth, and press signals from the live web and writes the brief.
              </p>

              <form className="intel-search-form" onSubmit={handleAnalyze}>
                <input
                  className="intel-search-input"
                  type="text"
                  placeholder="e.g. Notion, Figma, Stripe..."
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={analyzing}
                  autoFocus
                />
                <button
                  className="intel-search-button"
                  type="submit"
                  disabled={analyzing || !companyName.trim()}
                >
                  {analyzing ? (
                    <span className="scanning-label">
                      <span className="scanning-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                      Analyzing
                    </span>
                  ) : (
                    'Analyze →'
                  )}
                </button>
              </form>

              <input
                className="intel-search-context"
                type="text"
                placeholder="Add context for the analyst (optional)"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={analyzing}
              />

              {error && <p className="intel-search-error">{error}</p>}

              <button
                type="button"
                className="intel-compare-link"
                onClick={() => setView('compare')}
              >
                Or compare two companies →
              </button>
            </div>

            <div className="intel-history">
              <p className="intel-history-label">Recent reports</p>

              {historyLoading ? (
                <div className="intel-history-list">
                  <div className="intel-history-skeleton" aria-hidden="true" />
                  <div className="intel-history-skeleton" aria-hidden="true" />
                  <div className="intel-history-skeleton" aria-hidden="true" />
                </div>
              ) : history.length === 0 ? (
                <p className="intel-history-empty">
                  No reports yet — analyze a company above to get started.
                </p>
              ) : (
                <ul className="intel-history-list">
                  {history.map((item, i) => (
                    <li key={item.id ?? `${item.company_name}-${item.created_at}-${i}`}>
                      <button
                        className="intel-history-item"
                        onClick={() => openHistoryItem(item)}
                      >
                        <span className="intel-history-company">{item.company_name}</span>
                        <span className="intel-history-meta">{formatTimestamp(item.created_at)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {view === 'report' && (
          <div className="intel-report-page">
            <div className="intel-report-toolbar">
              <div className="intel-report-toolbar-row">
                <button className="intel-back-button" onClick={backToSearch}>
                  ← New search
                </button>
                {activeReport.id && (
                  <button className="intel-share-button" onClick={handleShare}>
                    {copied ? 'Copied!' : 'Share →'}
                  </button>
                )}
              </div>
              <h1 className="intel-report-company">{activeReport.company_name}</h1>
            </div>
            <ThreatTimeline companyName={activeReport.company_name} userId={userId} />
            <IntelReport data={activeReport} />
          </div>
        )}

        {view === 'compare' && (
          <div className="compare-page">
            {!compareResult ? (
              <div className="compare-form-wrap">
                <button className="intel-back-button" onClick={backToSearch}>
                  ← Back
                </button>
                <h1 className="intel-search-title">
                  <span className="accent">Compare</span> two companies.
                </h1>
                <p className="intel-search-sub">
                  Your agent analyzes both in parallel and writes a head-to-head verdict.
                </p>

                <form className="compare-form" onSubmit={handleCompare}>
                  <div className="compare-form-inputs">
                    <input
                      className="intel-search-input"
                      type="text"
                      placeholder="Company A (e.g. Notion)"
                      value={companyA}
                      onChange={(e) => {
                        setCompanyA(e.target.value);
                        if (compareError) setCompareError('');
                      }}
                      disabled={comparing}
                      autoFocus
                    />
                    <span className="compare-form-vs">vs</span>
                    <input
                      className="intel-search-input"
                      type="text"
                      placeholder="Company B (e.g. Figma)"
                      value={companyB}
                      onChange={(e) => {
                        setCompanyB(e.target.value);
                        if (compareError) setCompareError('');
                      }}
                      disabled={comparing}
                    />
                  </div>
                  <button
                    className="intel-search-button"
                    type="submit"
                    disabled={comparing || !companyA.trim() || !companyB.trim()}
                  >
                    {comparing ? (
                      <span className="scanning-label">
                        <span className="scanning-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                        Comparing
                      </span>
                    ) : (
                      'Compare →'
                    )}
                  </button>
                </form>

                {compareError && <p className="intel-search-error">{compareError}</p>}
              </div>
            ) : (
              <>
                <div className="intel-report-toolbar">
                  <div className="intel-report-toolbar-row">
                    <button className="intel-back-button" onClick={backToSearch}>
                      ← New search
                    </button>
                  </div>
                  <h1 className="intel-report-company">
                    {compareResult.a.company_name}
                    <span className="compare-vs-text"> vs </span>
                    {compareResult.b.company_name}
                  </h1>
                </div>
                <CompareView result={compareResult} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
