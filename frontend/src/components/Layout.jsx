import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="container">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>CampusPulse</strong>
          <span> · Making campus better, one report at a time.</span>
        </div>

        <span>Smart Campus Platform</span>
      </footer>
    </div>
  );
}