import { useAuthStore } from '@/store/useAuthStore';
import type { AiReview, Course, TimingLap, User } from '@/types';

export interface ApiSubmission {
  id: string;
  studentId: string;
  repoUrl: string;
  createdAt: string;
}

interface LoginResponse {
  token: string;
  user: Omit<User, 'role' | 'isActive'>;
}

const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
  if (baseUrl) return baseUrl;
  if (import.meta.env.DEV) return 'http://localhost:4000/api';
  throw new Error('VITE_API_URL is not set. Configure it in the deployment environment and rebuild the frontend.');
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authenticated) {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Your session has expired. Please log in again.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('The request took too long. Please try again.');
    }
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach the API at ${url}. Start it with "npm run api", verify CORS_ORIGIN allows this page, and check the MongoDB configuration.`,
      );
    }
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === 'string') message = body.message;
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }

    if (authenticated && response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  getCourses: () => request<Course[]>('/courses'),
  getCourse: (code: string) => request<Course>(`/courses/${encodeURIComponent(code)}`),
  register: (data: { name: string; email: string; password: string }) =>
    request<{ id: string; name: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubmissions: () => request<ApiSubmission[]>('/submissions', {}, true),
  createSubmission: (repoUrl: string) =>
    request<ApiSubmission>(
      '/submissions',
      { method: 'POST', body: JSON.stringify({ repoUrl }) },
      true,
    ),
  deleteSubmission: (id: string) =>
    request<void>(`/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' }, true),
  getTimingLaps: () => request<TimingLap[]>('/timing/laps', {}, true),
  createTimingLap: (data: Pick<TimingLap, 'driverName' | 'carModel' | 'bestLapTime'>) =>
    request<TimingLap>('/timing/laps', { method: 'POST', body: JSON.stringify(data) }, true),
  askAI: (prompt: string) =>
    request<AiReview>(
      '/ai',
      { method: 'POST', body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(30_000) },
      true,
    ),
};
