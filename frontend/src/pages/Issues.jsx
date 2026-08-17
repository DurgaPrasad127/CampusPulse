import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const filters = [
  { value: '', label: 'All Issues' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get('/issues', {
        params: status ? { status } : {},
      });

      setIssues(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  async function vote(id) {
    try {
      await api.post(`/issues/${id}/vote`);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Vote failed');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">CAMPUS VOICE</p>
          <h1>Campus Issues</h1>
          <p className="page-description">
            See what's happening around campus and support issues
            that matter to you.
          </p>
        </div>

        <Link className="primary button-link" to="/report">
          + Report Issue
        </Link>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                status === filter.value
                  ? 'filter active'
                  : 'filter'
              }
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span className="results-count">
          {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="issue-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="card skeleton-card" key={item}>
              <div className="skeleton skeleton-small" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="issue-grid">
          {issues.map((issue) => (
            <article className="card issue-card enhanced-card" key={issue.id}>
              <div className="issue-card-top">
                <span
                  className={`badge ${issue.status.toLowerCase()}`}
                >
                  {issue.status.replace('_', ' ')}
                </span>

                <span className={`priority priority-${issue.priority.toLowerCase()}`}>
                  {issue.priority}
                </span>
              </div>

              <div className="issue-card-icon">
                {issue.category?.charAt(0)?.toUpperCase() || 'I'}
              </div>

              <h2>{issue.title}</h2>

              <p>{issue.description}</p>

              <div className="issue-meta">
                <span>⌖ {issue.location}</span>
                <span>• {issue.category}</span>
              </div>

              <div className="issue-actions">
                <span className="vote-count">
                  ▲ {issue.vote_count} vote{issue.vote_count !== 1 ? 's' : ''}
                </span>

                <button
                  className="vote-button"
                  type="button"
                  onClick={() => vote(issue.id)}
                >
                  ▲ Support
                </button>

                <Link
                  className="details-link"
                  to={`/issues/${issue.id}`}
                >
                  Details →
                </Link>
              </div>
            </article>
          ))}

          {!issues.length && (
            <div className="empty-page card">
              <div className="empty-icon large">◌</div>
              <h2>No issues found</h2>
              <p>
                There are no issues matching the selected filter.
              </p>

              <Link className="primary button-link" to="/report">
                Report an Issue
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}