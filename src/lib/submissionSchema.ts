import { z } from "zod";

export const submissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  link: z.url("Must be a valid URL"),
});

export type SubmissionFormValues = z.infer<typeof submissionSchema>;