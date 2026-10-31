import { z } from 'zod';

export const timingLapSchema = z
  .object({
    driverName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    carModel: z.string().trim().min(1, 'Enter a car or car number').max(80),
    bestLapTime: z
      .string()
      .regex(/^[0-5][0-9]:[0-5][0-9]\.[0-9]{3}$/, 'Format must be MM:SS.mmm'),
  })
  .refine((values) => values.bestLapTime !== '00:00.000', {
    path: ['bestLapTime'],
    message: 'Lap time must be greater than zero',
  });

export type TimingLapFormData = z.infer<typeof timingLapSchema>;
