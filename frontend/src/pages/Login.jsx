import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { saveSession } from '../utils/auth.js';

export default function Login() {
  const [form, setForm] = useState({
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
      const { data } = await api.post('/auth/login', form);

      saveSession(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to sign in. Please check your details.'
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

        <p className="eyebrow">WELCOME BACK</p>

        <h1>Sign in to your campus.</h1>

        <p className="auth-subtitle">
          Stay connected with issues, events and everything
          happening around campus.
        </p>

        {error && (
          <div className="alert">
            <span>!</span>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              required
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
              placeholder="Enter your password"
              required
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
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-footer">
          New to CampusPulse?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}