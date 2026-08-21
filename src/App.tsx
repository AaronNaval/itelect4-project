import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { UserProfile } from './pages/UserProfile';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Parent Route */}
      <Route element={<ProtectedRoute />}>
        {/* Nested Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<h3>Welcome to the Dashboard Overview</h3>} />
          <Route path="users/:userId" element={<UserProfile />} />
        </Route>
      </Route>

      {/* Redirect root URL to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default App;