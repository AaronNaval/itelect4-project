import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.register({ name: name.trim(), email: email.trim(), password });
      navigate('/login', { replace: true, state: { email } });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101b25] px-4 py-8">
      <div className="fixed right-5 top-5"><ThemeToggle /></div>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl dark:bg-slate-950">
        <div className="bg-[#152936] px-8 py-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Race control</p>
          <h1 className="mt-2 text-2xl font-black">Create your account</h1>
        </div>
        <form onSubmit={handleRegister} className="space-y-5 p-8 dark:text-slate-100">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" minLength={2} required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            <p className="text-xs text-slate-500">Use at least 8 characters.</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already registered? <Link to="/login" className="font-semibold text-cyan-700 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
