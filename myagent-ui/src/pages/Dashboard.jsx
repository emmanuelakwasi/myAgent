import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopics } from '../services/api';
import TopicCard from '../components/TopicCard';
import AddTopicModal from '../components/AddTopicModal';

function SkeletonCard() {
  return <div className="skeleton-card" aria-hidden="true" />;
}

// Demo mode only. Remove before shipping to production.
const DEMO_TOPICS = [
  { id: '__demo_1', label: 'My project',       query: 'myagent.fyi hackathon' },
  { id: '__demo_2', label: 'Competitor watch',  query: 'AI monitoring tools 2026' },
];

export default function Dashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'myagent.fyi';
  }, []);

  useEffect(() => {
    getTopics(userId)
      .then((res) => setTopics(res.data))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [userId]);

  function handleTopicCreated(newTopic) {
    setTopics((prev) => [newTopic, ...prev]);
    setModalOpen(false);
  }

  function handleTopicDeleted(topicId) {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  }

  function activateDemoMode() {
    setTopics(DEMO_TOPICS);
    setLoading(false);
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <button className="topbar-brand" onClick={() => navigate('/')}>
          myagent<span className="accent">.fyi</span>
        </button>
        <div className="topbar-right">
          <span className="topbar-user">{userId}</span>
          {/* Demo mode only. Remove before shipping to production. */}
          <button className="btn-demo" onClick={activateDemoMode}>
            Demo mode
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={() => setModalOpen(true)}
          >
            + Add topic
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {loading ? (
          <div className="topic-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-heading">Nothing being watched yet.</p>
            <p className="empty-state-sub">
              Add your first topic to start monitoring the web.
            </p>
            <button
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              + Add your first topic
            </button>
          </div>
        ) : (
          <div className="topic-grid">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onDeleted={handleTopicDeleted}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <AddTopicModal
          userId={userId}
          onTopicCreated={handleTopicCreated}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
