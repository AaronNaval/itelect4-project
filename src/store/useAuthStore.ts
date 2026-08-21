import { create } from 'zustand';
import type { User } from '../types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (userName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (userName) =>
    set({
      token: `demo-token-${userName}`,
      user: { id: 1, name: userName, email: `${userName.toLowerCase()}@example.com`, role: 'student', isActive: true },
    }),
  logout: () => set({ token: null, user: null }),
}));