import { NavLink, Outlet, useNavigate } from 'react-router';
import { Activity, Bot, LayoutDashboard, LogOut, Timer, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from './ThemeToggle';

export const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-transparent text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 bg-[#101b25] text-slate-200 flex flex-col justify-between p-4 border-r border-slate-800 shadow-2xl shadow-slate-900/10">
        <div className="space-y-6">
          {/* Header */}
          <div className="px-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-400 text-[#101b25] shadow-lg shadow-cyan-400/20">
                <Activity size={19} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">Race Control</h1>
            </div>
            <p className="text-xs text-slate-400 mt-3 pl-1">
              Logged in as <span className="font-semibold text-slate-200">{user?.name || 'Aaron'}</span>
            </p>
          </div>

          {/* Navigation Links with Active State Highlighting */}
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={17} />
              Overview
            </NavLink>

            <NavLink
              to="/dashboard/timing"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Timer size={17} />
              Timing Desk
            </NavLink>

            <NavLink
              to="/dashboard/ai-review"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Bot size={17} />
              AI Review
            </NavLink>

            <NavLink
              to={`/dashboard/users/${user?.id ?? 1}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <UserRound size={17} />
              Driver Profile
            </NavLink>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg transition cursor-pointer border border-slate-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl justify-end pb-3">
          <ThemeToggle />
        </div>
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};