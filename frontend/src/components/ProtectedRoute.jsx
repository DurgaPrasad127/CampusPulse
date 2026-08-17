import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../utils/auth.js';

export default function ProtectedRoute({ adminOnly = false }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
