import { Link, Outlet } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      <aside style={{ borderRight: '1px solid #ccc', paddingRight: '1rem' }}>
        <h3>Dashboard</h3>
        <p>Logged in as: <strong>{user?.name}</strong></p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/users/1">User #1 Profile</Link>
          <Link to="/dashboard/users/2">User #2 Profile</Link>
        </nav>
        <button onClick={logout} style={{ marginTop: '1rem' }}>
          Logout
        </button>
      </aside>

      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};