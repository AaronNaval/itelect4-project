import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Flag, Gauge, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';
import type { TimingLap } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { timingLapSchema, type TimingLapFormData } from '@/schemas/timingLapSchema';

const lapTimeToMilliseconds = (lapTime: string) => {
  const [minutes, remainder] = lapTime.split(':');
  const [seconds, milliseconds] = remainder.split('.');
  return Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(milliseconds);
};

const formatGap = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1_000);
  const remainder = milliseconds % 1_000;
  return `+${seconds}.${String(remainder).padStart(3, '0')}s`;
};

const getBestLaps = (laps: TimingLap[]) => {
  const bestByDriverAndCar = new Map<string, TimingLap>();

  for (const lap of laps) {
    const key = `${lap.driverName.trim().toLowerCase()}|${lap.carModel.trim().toLowerCase()}`;
    const currentBest = bestByDriverAndCar.get(key);
    if (!currentBest || lapTimeToMilliseconds(lap.bestLapTime) < lapTimeToMilliseconds(currentBest.bestLapTime)) {
      bestByDriverAndCar.set(key, lap);
    }
  }

  return [...bestByDriverAndCar.values()].sort(
    (first, second) => lapTimeToMilliseconds(first.bestLapTime) - lapTimeToMilliseconds(second.bestLapTime),
  );
};

export const TimingDeskPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<TimingLapFormData>({
    driverName: '',
    carModel: '',
    bestLapTime: '',
  });
  const [formError, setFormError] = useState('');
  const { data: laps = [], isLoading, error } = useQuery({
    queryKey: ['timing-laps'],
    queryFn: apiClient.getTimingLaps,
  });

  const recordMutation = useMutation({
    mutationFn: apiClient.createTimingLap,
    onSuccess: () => {
      setForm({ driverName: '', carModel: '', bestLapTime: '' });
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['timing-laps'] });
    },
    onError: (mutationError: Error) => setFormError(mutationError.message),
  });

  const bestLaps = useMemo(() => getBestLaps(laps), [laps]);
  const fastestLap = bestLaps[0];
  const uniqueDrivers = new Set(laps.map((lap) => lap.driverName.trim().toLowerCase())).size;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const parsed = timingLapSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the lap details and try again.');
      return;
    }
    recordMutation.mutate(parsed.data);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Race control / manual timing</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Timing Desk</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Record lap times and compare each driver/car combination. Entries are manual; no live car telemetry feed is connected.
        </p>
      </header>

      {formError && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error.message}</p>}

      <section className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
            <Flag size={17} />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">Manual lap entry</p>
          </div>
          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Record a lap</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a driver, car, and lap time in MM:SS.mmm format.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div>
            <Label htmlFor="driverName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Driver</Label>
            <Input
              id="driverName"
              autoComplete="off"
              maxLength={80}
              placeholder="Driver name"
              required
              value={form.driverName}
              onChange={(event) => setForm((current) => ({ ...current, driverName: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="carModel" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Car</Label>
            <Input
              id="carModel"
              autoComplete="off"
              maxLength={80}
              placeholder="e.g. GT3 car / car number"
              required
              value={form.carModel}
              onChange={(event) => setForm((current) => ({ ...current, carModel: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="bestLapTime" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Lap time</Label>
            <Input
              id="bestLapTime"
              inputMode="decimal"
              maxLength={10}
              placeholder="01:42.385"
              required
              value={form.bestLapTime}
              onChange={(event) => setForm((current) => ({ ...current, bestLapTime: event.target.value }))}
            />
          </div>
          <Button type="submit" disabled={recordMutation.isPending} className="bg-cyan-600 text-white hover:bg-cyan-700">
            {recordMutation.isPending ? 'Recording...' : 'Record lap'}
          </Button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white">
          <Timer className="size-5 text-cyan-300" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Fastest lap</p>
          <p className="mt-2 text-2xl font-black">{isLoading ? '...' : fastestLap?.bestLapTime ?? '--:--.---'}</p>
          <p className="mt-1 truncate text-sm text-cyan-200">{fastestLap ? `${fastestLap.driverName} · ${fastestLap.carModel}` : 'No laps recorded'}</p>
        </div>
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900 dark:bg-cyan-950/50">
          <Activity className="size-5 text-cyan-700 dark:text-cyan-300" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Lap entries</p>
          <p className="mt-2 text-3xl font-black text-cyan-950 dark:text-cyan-100">{isLoading ? '...' : laps.length}</p>
          <p className="mt-1 text-sm text-cyan-800 dark:text-cyan-200">Manually recorded</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <Gauge className="size-5 text-amber-700 dark:text-amber-300" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Drivers</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-amber-50">{isLoading ? '...' : uniqueDrivers}</p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">On the timing sheet</p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Classified by best lap</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Timing leaderboard</h3>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading lap records...</p>
        ) : bestLaps.length === 0 ? (
          <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">No lap times recorded. Add the first entry above.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-900 font-semibold text-slate-200">
                <tr>
                  <th scope="col" className="p-3">Pos</th>
                  <th scope="col" className="p-3">Driver</th>
                  <th scope="col" className="p-3">Car</th>
                  <th scope="col" className="p-3">Best lap</th>
                  <th scope="col" className="p-3">Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {bestLaps.map((lap, index) => (
                  <tr key={lap.id} className={index === 0 ? 'bg-cyan-50/70 dark:bg-cyan-950/30' : ''}>
                    <td className="p-3 font-bold">{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{lap.driverName}</td>
                    <td className="p-3">{lap.carModel}</td>
                    <td className="p-3 font-mono font-bold text-cyan-800 dark:text-cyan-300">{lap.bestLapTime}</td>
                    <td className="p-3 font-mono">
                      {index === 0 ? 'LEADER' : formatGap(lapTimeToMilliseconds(lap.bestLapTime) - lapTimeToMilliseconds(bestLaps[0].bestLapTime))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Race control log</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Recent lap entries</h3>
        </div>
        {laps.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-900 font-semibold text-slate-200">
                <tr>
                  <th scope="col" className="p-3">Driver</th>
                  <th scope="col" className="p-3">Car</th>
                  <th scope="col" className="p-3">Lap time</th>
                  <th scope="col" className="p-3">Recorded by</th>
                  <th scope="col" className="p-3">Recorded at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {laps.map((lap) => (
                  <tr key={lap.id}>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{lap.driverName}</td>
                    <td className="p-3">{lap.carModel}</td>
                    <td className="p-3 font-mono">{lap.bestLapTime}</td>
                    <td className="p-3">{lap.recordedBy === user?.id ? 'You' : 'Race control'}</td>
                    <td className="p-3">{new Date(lap.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
