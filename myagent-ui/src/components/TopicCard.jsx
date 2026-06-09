import { useEffect, useState } from 'react';
import { getBriefings, runBriefing, deleteTopic } from '../services/api';
import BriefingCard from './BriefingCard';

const DEMO_BRIEFINGS = {
  __demo_1: {
    summary: `WHAT'S NEW — myagent.fyi demoed live at the hackathon, showing real-time web monitoring with AI-generated briefings for any topic a user wants to track.\nWHAT MATTERS — The product eliminates the need to manually check news, forums, and search results — the agent does it on demand and surfaces only what changed.\nNOISE — Early-stage coverage is mostly from the hackathon itself; broader press attention should follow post-launch.`,
    results: [
      { title: 'myagent.fyi wins best AI tool at hackathon', url: 'https://example.com/1' },
      { title: 'Autonomous web monitoring agents are trending in 2026', url: 'https://example.com/2' },
    ],
    created_at: new Date().toISOString(),
  },
  __demo_2: {
    summary: `WHAT'S NEW — Several new AI monitoring tools launched in Q2 2026, including agent-based platforms that watch keywords, competitors, and news feeds autonomously.\nWHAT MATTERS — The space is consolidating quickly; teams that ship first with a clean UX are capturing early adopters before enterprise players enter.\nNOISE — Several "AI monitoring" products are just rebranded Google Alerts — look for genuine agent architecture before taking comparisons seriously.`,
    results: [
      { title: 'Top AI monitoring tools to watch in 2026', url: 'https://example.com/3' },
      { title: 'Competitor landscape: autonomous web agents', url: 'https://example.com/4' },
    ],
    created_at: new Date().toISOString(),
  },
};

const isDemo = (id) => id?.startsWith('__demo_');

export default function TopicCard({ topic, onDeleted }) {
  const [briefing, setBriefing] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (isDemo(topic.id)) return;
    getBriefings(topic.id)
      .then((res) => {
        const list = res.data;
        if (list && list.length > 0) setBriefing(list[0]);
      })
      .catch(() => {});
  }, [topic.id]);

  async function handleRun() {
    setRunning(true);
    setRunError('');
    setNoResults(false);

    if (isDemo(topic.id)) {
      // Simulate a realistic scanning delay for the demo
      await new Promise((r) => setTimeout(r, 2200));
      setBriefing(DEMO_BRIEFINGS[topic.id] ?? DEMO_BRIEFINGS.__demo_1);
      setRunning(false);
      return;
    }

    try {
      const res = await runBriefing(topic.id);
      const data = res.data;
      const msg = (data.message || data.summary || '').toLowerCase();
      if (msg.includes('no new results')) {
        setNoResults(true);
      } else {
        setBriefing(data);
      }
    } catch {
      setRunError('Something went wrong. Check your API keys and try again.');
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete() {
    if (!isDemo(topic.id)) {
      try {
        await deleteTopic(topic.id);
      } catch {
        // best-effort
      }
    }
    onDeleted(topic.id);
  }

  return (
    <div className={`topic-card${visible ? ' fade-in' : ' invisible'}`}>
      <div className="topic-card-header">
        <div className="topic-card-meta">
          <h3 className="topic-card-title">{topic.label}</h3>
          <span className="topic-card-query">{topic.query}</span>
        </div>
        <button className="btn-remove" onClick={handleDelete}>
          Remove
        </button>
      </div>

      <div className="topic-card-actions">
        <button
          className={`btn-run${running ? ' btn-run--active' : ''}`}
          onClick={handleRun}
          disabled={running}
        >
          {running ? (
            <span className="scanning-label">
              <span className="scanning-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
              Scanning web
            </span>
          ) : (
            'Run agent'
          )}
        </button>
      </div>

      {runError && <p className="run-error">{runError}</p>}

      {noResults && (
        <div className="no-new-results">
          Agent ran — nothing new since last check.
        </div>
      )}

      <div className="topic-card-briefing">
        {briefing ? (
          <BriefingCard briefing={briefing} />
        ) : (
          !noResults && (
            <p className="no-briefing">
              No briefing yet. Run the agent to fetch your first report.
            </p>
          )
        )}
      </div>
    </div>
  );
}
