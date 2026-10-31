import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Activity, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState(
    (location.state as { email?: string } | null)?.email ?? '',
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { token, user } = await apiClient.login({ email, password });
      setSession(user, token);
      navigate('/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101b25] px-4 py-8">
      <div className="fixed right-5 top-5"><ThemeToggle /></div>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl shadow-black/30 dark:bg-slate-950">
        <div className="bg-[#152936] px-8 py-9 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-400 text-[#101b25]"><Activity size={23} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Race control</p><h1 className="text-2xl font-black tracking-tight">Telemetry Access</h1></div>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-6 text-slate-300">Track your pace, compare chassis performance, and keep every driver time in view.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 p-8 dark:text-slate-100">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="h-11 w-full bg-cyan-600 text-white hover:bg-cyan-700">
            {isSubmitting ? 'Signing in...' : <>Enter Dashboard <ArrowRight size={17} /></>}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Need an account? <Link to="/register" className="font-semibold text-cyan-700 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
