import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.user !== null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};