import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const categories = [
  'Network',
  'Electrical',
  'Water',
  'Classroom',
  'Hostel',
  'Cleanliness',
  'Other',
];

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Network',
    location: '',
    priority: 'MEDIUM',
  });

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      await api.post('/issues', form);

      setMessage('Issue reported successfully.');

      setTimeout(() => {
        navigate('/issues');
      }, 700);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Could not report the issue.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-intro">
        <div>
          <p className="eyebrow">CAMPUS VOICE</p>
          <h1>Report an Issue</h1>
          <p>
            Give enough detail so the right campus team can act.
          </p>
        </div>

        <div className="form-step">
          <span>01</span>
          <small>Report</small>
        </div>
      </div>

      <section className="card form-card enhanced-form-card">
        {message && (
          <div className="success-message">
            <span>✓</span>
            {message}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h2>What's the problem?</h2>
                <p>Give your issue a short, clear title.</p>
              </div>
            </div>

            <label>
              Issue title
              <input
                required
                placeholder="e.g. Wi-Fi not working in Block B"
                value={form.title}
                onChange={(event) =>
                  updateField('title', event.target.value)
                }
              />
            </label>

            <label>
              Description
              <textarea
                required
                rows="6"
                placeholder="Describe what happened, where it happened, and any useful details..."
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
              />

              <span className="field-hint">
                Please provide enough information for the campus team
                to investigate.
              </span>
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h2>Categorize the issue</h2>
                <p>Help us route it to the right team.</p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField('category', event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    updateField('priority', event.target.value)
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>03</span>
              <div>
                <h2>Where is it?</h2>
                <p>Tell us exactly where the issue occurred.</p>
              </div>
            </div>

            <label>
              Location
              <input
                required
                placeholder="e.g. Block B - 2nd Floor"
                value={form.location}
                onChange={(event) =>
                  updateField('location', event.target.value)
                }
              />
            </label>
          </div>

          <div className="form-footer">
            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>

            <button
              className="primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Issue →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}