import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../utils/auth.js';

export default function Navbar() {
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/issues', label: 'Issues' },
    { to: '/events', label: 'Events' },
    { to: '/report', label: 'Report Issue' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark">C</span>
          <span>Campus<span>Pulse</span></span>
        </Link>

        <button
          className="mobile-menu"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="nav-divider" />

          <div className="user-menu">
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="user-info">
              <strong>{user?.name || 'User'}</strong>
              <span>{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
            </div>
          </div>

          <button className="logout-button" type="button" onClick={logout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}