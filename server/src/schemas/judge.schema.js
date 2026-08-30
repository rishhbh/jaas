import { z } from 'zod';

export const judgeReadmeSchema = z
  .object({
    repoUrl: z.string().trim().optional(),
    readmeText: z.string().trim().optional(),
    model: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.repoUrl || data.readmeText), {
    message: 'Either repoUrl or readmeText must be provided',
    path: ['repoUrl'],
  });
