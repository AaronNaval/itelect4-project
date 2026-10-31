import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Activity, CheckCircle2, CircleAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { aiPromptSchema } from '@/schemas/aiReviewSchema';
import type { AiReviewReadiness } from '@/types';

const readinessLabels: Record<AiReviewReadiness, string> = {
  ready: 'Ready',
  'needs-work': 'Needs work',
  'not-ready': 'Not ready',
};

const readinessStyles: Record<AiReviewReadiness, string> = {
  ready: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
  'needs-work': 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
  'not-ready': 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
};

export const AiReviewPage = () => {
  const [prompt, setPrompt] = useState('');
  const [validationError, setValidationError] = useState('');
  const reviewMutation = useMutation({
    mutationFn: apiClient.askAI,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reviewMutation.reset();
    const parsed = aiPromptSchema.safeParse({ prompt });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Check your description and try again.');
      return;
    }
    setValidationError('');
    reviewMutation.mutate(parsed.data.prompt);
  };

  const review = reviewMutation.data;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Race control / project tools</p>
        <h2 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          <Sparkles className="size-7 text-cyan-600" />
          AI Project Review
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Get structured feedback on how you describe the GT3 Race Control Telemetry app. Your text is reviewed as project data, not followed as instructions.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">Gemini review</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Describe your project</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter 20–2000 characters. Do not include passwords, API keys, or other secrets.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label htmlFor="projectPrompt" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Project description
          </label>
          <textarea
            id="projectPrompt"
            rows={6}
            maxLength={2000}
            required
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setValidationError('');
            }}
            placeholder="Describe who uses the race-control timing desk, how lap times are recorded, and what the leaderboard shows..."
            aria-invalid={Boolean(validationError)}
            aria-describedby="prompt-help prompt-count"
            className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:border-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-600/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="prompt-help" className="text-xs text-slate-500 dark:text-slate-400">
              Describe the app itself; the review endpoint does not inspect source code.
            </p>
            <span id="prompt-count" className="text-xs tabular-nums text-slate-500">{prompt.length}/2000</span>
          </div>
          {validationError && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{validationError}</p>}
          {reviewMutation.error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">{reviewMutation.error.message}</p>}
          <Button type="submit" disabled={reviewMutation.isPending} className="bg-cyan-600 text-white hover:bg-cyan-700">
            <Sparkles size={16} />
            {reviewMutation.isPending ? 'Reviewing...' : 'Review my project'}
          </Button>
        </form>
      </section>

      {reviewMutation.isPending && (
        <p role="status" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Activity className="size-4 animate-pulse text-cyan-600" /> Gemini is reviewing your description...
        </p>
      )}

      {review && (
        <section aria-live="polite" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-cyan-700 dark:text-cyan-300" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Review complete</h3>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-sm font-bold ${readinessStyles[review.readiness]}`}>
              {readinessLabels[review.readiness]}
            </span>
          </div>

          <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-bold text-slate-900 dark:text-white">Summary</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.summary}</p>
          </article>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <h4 className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 size={17} /> Strengths
              </h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {review.strengths.map((strength, index) => <li key={`${index}-${strength}`}>{strength}</li>)}
              </ul>
            </article>
            <article className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-950/30">
              <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                <CircleAlert size={17} /> Improvements
              </h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {review.improvements.map((improvement, index) => <li key={`${index}-${improvement}`}>{improvement}</li>)}
              </ul>
            </article>
          </div>
        </section>
      )}
    </div>
  );
};
