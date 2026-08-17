import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { saveSession } from '../utils/auth.js';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);

      saveSession(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to create your account.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">C</span>
          <strong>Campus<span>Pulse</span></strong>
        </div>

        <p className="eyebrow">JOIN CAMPUSPULSE</p>

        <h1>Create your account.</h1>

        <p className="auth-subtitle">
          Join your campus community and help make things better.
        </p>

        {error && (
          <div className="alert">
            <span>!</span>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label>
            Full name
            <input
              required
              placeholder="Pandre Durga Prasad"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="8"
              required
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
            />
          </label>

          <button className="primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}