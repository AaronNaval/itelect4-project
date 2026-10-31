import { z } from 'zod';

export const aiPromptSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(20, 'Describe your project in at least 20 characters.')
      .max(2000, 'Project description must be at most 2000 characters.'),
  })
  .strict();

export const aiReviewSchema = z
  .object({
    summary: z.string().min(1).max(1200),
    strengths: z.array(z.string().min(1).max(500)).min(1).max(8),
    improvements: z.array(z.string().min(1).max(500)).min(1).max(8),
    readiness: z.enum(['ready', 'needs-work', 'not-ready']),
  })
  .strict();
