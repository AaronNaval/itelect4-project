import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage = () => {
  const [name, setName] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    login(name);
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem', display: 'block' }}
        />
        <button type="submit" disabled={!name.trim()}>
          Log In
        </button>
      </form>
    </div>
  );
};