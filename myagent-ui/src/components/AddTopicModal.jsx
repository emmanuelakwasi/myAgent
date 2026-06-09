import { useState } from 'react';
import { createTopic } from '../services/api';

export default function AddTopicModal({ userId, onTopicCreated, onClose }) {
  const [label, setLabel] = useState('');
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!label.trim()) next.label = 'Give this topic a name.';
    if (!query.trim()) next.query = 'Enter a search query.';
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTopic(userId, label.trim(), query.trim());
      onTopicCreated(res.data);
    } catch {
      setErrors({ form: 'Something went wrong. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="modal-heading">What do you want to watch?</h2>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label className="modal-label" htmlFor="topic-name">
              Topic name
            </label>
            <input
              id="topic-name"
              className={`modal-input${errors.label ? ' modal-input--error' : ''}`}
              type="text"
              placeholder="e.g. My startup"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errors.label) setErrors((p) => ({ ...p, label: undefined }));
              }}
            />
            {errors.label && (
              <p className="modal-error">{errors.label}</p>
            )}
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="topic-query">
              Search query
            </label>
            <input
              id="topic-query"
              className={`modal-input${errors.query ? ' modal-input--error' : ''}`}
              type="text"
              placeholder="e.g. Acme Corp reviews 2026"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errors.query) setErrors((p) => ({ ...p, query: undefined }));
              }}
            />
            <p className="modal-hint">
              Be specific. The more precise the query, the less noise you get back.
            </p>
            {errors.query && (
              <p className="modal-error">{errors.query}</p>
            )}
          </div>

          {errors.form && <p className="modal-error">{errors.form}</p>}

          <button
            className="btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Starting…' : 'Start watching'}
          </button>
        </form>
      </div>
    </div>
  );
}
