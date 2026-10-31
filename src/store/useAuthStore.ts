import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (user: Omit<User, 'role' | 'isActive'>, token: string) => void;
  logout: () => void;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const parsed = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof parsed.exp !== 'number' || parsed.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        if (isTokenExpired(token)) {
          set({ token: null, user: null });
          throw new Error('The server returned an invalid or expired login token.');
        }
        set({
          token,
          user: { ...user, role: 'student', isActive: true },
        });
      },
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'gt3-telemetry-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token && isTokenExpired(state.token)) {
          state.logout();
        }
      },
    },
  ),
);
