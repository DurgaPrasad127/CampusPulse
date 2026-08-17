import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { getUser } from '../utils/auth.js';

const statusMeta = {
  OPEN: {
    label: 'Open',
    className: 'open',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'in_progress',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'resolved',
  },
};

export default function Dashboard() {
  const user = getUser();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [issues, setIssues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsResponse, issuesResponse, eventsResponse] =
          await Promise.all([
            api.get('/issues/stats'),
            api.get('/issues'),
            api.get('/events'),
          ]);

        setStats(statsResponse.data);
        setIssues(issuesResponse.data.slice(0, 4));
        setEvents(eventsResponse.data.slice(0, 3));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <span className="pulse-dot" />
            SMART CAMPUS PLATFORM
          </div>

          <h1>
            Make campus better,
            <span> one report at a time.</span>
          </h1>

          <p>
            Report problems, support important issues and stay
            connected with what's happening around your campus.
          </p>

          <div className="hero-actions">
            <Link className="primary button-link" to="/report">
              <span>+</span>
              Report an Issue
            </Link>

            <Link className="secondary button-link" to="/issues">
              Explore Issues →
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />

          <div className="hero-card floating-card">
            <div className="mini-icon">✓</div>
            <div>
              <strong>Campus Connected</strong>
              <span>Every voice matters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <div className="welcome-row">
        <div>
          <p className="eyebrow">YOUR CAMPUS</p>
          <h2>Good to see you, {user?.name?.split(' ')[0] || 'there'} 👋</h2>
        </div>

        <Link to="/issues" className="text-link">
          View all issues →
        </Link>
      </div>

      {/* Stats */}
      <section className="stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">◉</div>
          <span>Total Issues</span>
          <strong>{loading ? '—' : stats.total}</strong>
          <small>Reported on campus</small>
        </div>

        <div className="stat-card stat-open">
          <div className="stat-icon">!</div>
          <span>Open</span>
          <strong>{loading ? '—' : stats.open}</strong>
          <small>Need attention</small>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon">↻</div>
          <span>In Progress</span>
          <strong>{loading ? '—' : stats.in_progress}</strong>
          <small>Being worked on</small>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-icon">✓</div>
          <span>Resolved</span>
          <strong>{loading ? '—' : stats.resolved}</strong>
          <small>Successfully solved</small>
        </div>
      </section>

      {/* Main content */}
      <div className="dashboard-grid">

        {/* Issues */}
        <section className="card dashboard-section">
          <div className="section-head enhanced">
            <div>
              <p className="eyebrow">CAMPUS VOICE</p>
              <h2>Recent Issues</h2>
            </div>

            <Link to="/issues" className="text-link">
              View all →
            </Link>
          </div>

          <div className="issue-list">
            {issues.map((issue) => {
              const status = statusMeta[issue.status] || statusMeta.OPEN;

              return (
                <Link
                  to={`/issues/${issue.id}`}
                  className="dashboard-issue"
                  key={issue.id}
                >
                  <div className="issue-leading">
                    <div className="issue-avatar">
                      {issue.title?.charAt(0)?.toUpperCase() || 'I'}
                    </div>

                    <div>
                      <strong>{issue.title}</strong>

                      <span>
                        {issue.location} · {issue.category}
                      </span>
                    </div>
                  </div>

                  <div className="issue-trailing">
                    <span className={`badge ${status.className}`}>
                      {status.label}
                    </span>

                    <span className="issue-arrow">→</span>
                  </div>
                </Link>
              );
            })}

            {!loading && !issues.length && (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <strong>No issues yet</strong>
                <span>Your campus is looking good!</span>
              </div>
            )}
          </div>
        </section>

        {/* Events */}
        <section className="card dashboard-section">
          <div className="section-head enhanced">
            <div>
              <p className="eyebrow">CAMPUS CALENDAR</p>
              <h2>Upcoming Events</h2>
            </div>

            <Link to="/events" className="text-link">
              View all →
            </Link>
          </div>

          <div className="event-list">
            {events.map((event) => {
              const date = new Date(event.event_date);

              return (
                <Link to="/events" className="dashboard-event" key={event.id}>
                  <div className="event-date-box">
                    <strong>{date.getDate()}</strong>
                    <span>
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.location}</span>
                  </div>

                  <span className="issue-arrow">→</span>
                </Link>
              );
            })}

            {!loading && !events.length && (
              <div className="empty-state">
                <div className="empty-icon">◫</div>
                <strong>No upcoming events</strong>
                <span>Check back soon for campus activities.</span>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}