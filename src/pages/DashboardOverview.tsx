import { useQuery } from '@tanstack/react-query';
import { Activity, Gauge, Timer, Users } from 'lucide-react';
import { apiClient } from '@/api/client';
import { Link } from 'react-router';

const lapTimeToMilliseconds = (lapTime: string) => {
  const [minutes, remainder] = lapTime.split(':');
  const [seconds, milliseconds] = remainder.split('.');
  return Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(milliseconds);
};

export const DashboardOverview = () => {
  const { data: laps = [], isLoading, error } = useQuery({
    queryKey: ['timing-laps'],
    queryFn: apiClient.getTimingLaps,
  });
  const drivers = new Set(laps.map((lap) => lap.driverName.trim().toLowerCase()));
  const fastestLap = [...laps].sort(
    (first, second) => lapTimeToMilliseconds(first.bestLapTime) - lapTimeToMilliseconds(second.bestLapTime),
  )[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">GT3 / race control</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Timing Overview</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Race timing desk for manually recorded driver and car lap times.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error.message}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-lg">
          <Gauge className="absolute -right-2 -top-3 size-24 text-slate-800" />
          <p className="relative text-xs font-semibold uppercase tracking-wider text-slate-400">Lap entries</p>
          <p className="relative mt-3 text-4xl font-black">{isLoading ? '...' : laps.length}</p>
          <p className="relative mt-3 text-xs text-cyan-300">Times recorded by race control</p>
        </div>
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900 dark:bg-cyan-950/50">
          <Users className="size-5 text-cyan-700" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-cyan-700">Drivers on sheet</p>
          <p className="mt-2 text-4xl font-black text-cyan-950 dark:text-cyan-100">{isLoading ? '...' : drivers.size}</p>
          <p className="mt-3 text-xs font-medium text-cyan-700">Unique driver names</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <Timer className="size-5 text-amber-700" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-700">Fastest recorded lap</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-amber-50">
            {isLoading ? '...' : fastestLap?.bestLapTime ?? '--:--.---'}
          </p>
          <p className="mt-3 truncate text-xs font-medium text-amber-700">
            {fastestLap ? `${fastestLap.driverName} · ${fastestLap.carModel}` : 'No lap times yet'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 size-5 shrink-0 text-cyan-700 dark:text-cyan-300" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Manual timing mode</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Lap records are entered by race control and saved in MongoDB. This version does not yet receive live telemetry from a car or timing transponder.
            </p>
            <Link to="/dashboard/timing" className="mt-3 inline-flex text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
              Open timing desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
