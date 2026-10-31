import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const user = useAuthStore((state) => state.user);
  const { data: laps = [], isLoading, error } = useQuery({
    queryKey: ['timing-laps'],
    queryFn: apiClient.getTimingLaps,
  });

  const userLaps = laps.filter((lap) => lap.recordedBy === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex size-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
          {user?.name.slice(0, 1).toUpperCase() ?? '#'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.name ?? `Race control user ${userId}`}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-lg font-bold text-slate-800 dark:text-white">Lap records entered by you</h3>
        {error ? (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error.message}</p>
        ) : isLoading ? (
          <p className="text-sm text-slate-500">Loading lap records...</p>
        ) : userLaps.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-sm text-slate-500">You have not entered any lap records yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {userLaps.map((lap) => (
              <li key={lap.id} className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
                <span className="font-medium text-slate-800 dark:text-slate-100">{lap.driverName} · {lap.carModel}</span>
                <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{lap.bestLapTime}</span>
                <time className="shrink-0 text-xs text-slate-500" dateTime={lap.createdAt}>
                  {new Date(lap.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
