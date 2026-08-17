import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">CAMPUS CALENDAR</p>
          <h1>Upcoming Events</h1>
          <p className="page-description">
            Discover what's happening around campus.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="event-grid">
          {[1, 2, 3].map((item) => (
            <div className="card skeleton-card" key={item}>
              <div className="skeleton skeleton-date" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => {
            const date = new Date(event.event_date);

            return (
              <article className="card event-card" key={event.id}>
                <div className="event-card-date">
                  <strong>{date.getDate()}</strong>

                  <span>
                    {date.toLocaleDateString('en-US', {
                      month: 'short',
                    })}
                  </span>
                </div>

                <div className="event-card-content">
                  <span className="event-time">
                    {date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <h2>{event.title}</h2>

                  <p>{event.description}</p>

                  <div className="event-location">
                    ⌖ {event.location}
                  </div>
                </div>

                <div className="event-card-arrow">→</div>
              </article>
            );
          })}

          {!events.length && (
            <div className="empty-page card">
              <div className="empty-icon large">◫</div>
              <h2>No upcoming events</h2>
              <p>
                There are currently no events scheduled.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}