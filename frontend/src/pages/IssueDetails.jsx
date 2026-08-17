import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';

export default function IssueDetails() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/issues/${id}`);
        setIssue(response.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="card detail-loading">
        <div className="skeleton skeleton-small" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="empty-page card">
        <div className="empty-icon large">!</div>
        <h2>Issue not found</h2>
        <Link to="/issues" className="primary button-link">
          Back to Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/issues" className="back-link">
        ← Back to Issues
      </Link>

      <section className="card detail-card">
        <div className="detail-header">
          <div>
            <div className="detail-tags">
              <span className="badge">
                {issue.category}
              </span>

              <span className={`badge ${issue.status.toLowerCase()}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>

            <h1>{issue.title}</h1>
            <p>{issue.description}</p>
          </div>

          <div className="detail-votes">
            <strong>{issue.vote_count}</strong>
            <span>Votes</span>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">Location</span>
            <strong>{issue.location}</strong>
          </div>

          <div>
            <span className="detail-label">Priority</span>
            <strong>{issue.priority}</strong>
          </div>

          <div>
            <span className="detail-label">Status</span>
            <strong>{issue.status.replace('_', ' ')}</strong>
          </div>

          <div>
            <span className="detail-label">Reported by</span>
            <strong>{issue.reporter_name}</strong>
          </div>

          <div>
            <span className="detail-label">Votes</span>
            <strong>{issue.vote_count}</strong>
          </div>

          <div>
            <span className="detail-label">Assigned to</span>
            <strong>
              {issue.assignee_name || 'Unassigned'}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}