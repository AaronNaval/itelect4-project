import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { TimingDeskPage } from './pages/TimingDeskPage';
import { UserProfile } from './pages/UserProfile';
import { AiReviewPage } from './pages/AiReviewPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Parent Route */}
      <Route element={<ProtectedRoute />}>
        {/* Nested Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="timing" element={<TimingDeskPage />} />
          <Route path="ai-review" element={<AiReviewPage />} />
          <Route path="submissions" element={<Navigate to="/dashboard/timing" replace />} />
          <Route path="users/:userId" element={<UserProfile />} />
        </Route>
      </Route>

      {/* Redirect root URL to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <h2 className="text-xl font-bold text-slate-700">404 - Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default App;