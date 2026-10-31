import { z } from 'zod';

export const aiPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, 'Describe your project in at least 20 characters.')
    .max(2000, 'Project description must be at most 2000 characters.'),
});

export type AiPromptFormData = z.infer<typeof aiPromptSchema>;
