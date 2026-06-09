import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email so your topics are saved between sessions.');
      return;
    }
    localStorage.setItem('userId', trimmed);
    navigate(`/dashboard/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        <div className="onboarding-brand">
          <span className="live-dot" aria-hidden="true" />
          <h1 className="onboarding-title">
            myagent<span className="accent">.fyi</span>
          </h1>
        </div>
        <p className="onboarding-tagline">
          Your autonomous scout. Watching the web so you don't have to.
        </p>

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
            Activate my agent
          </button>
        </form>
      </div>
    </div>
  );
}
