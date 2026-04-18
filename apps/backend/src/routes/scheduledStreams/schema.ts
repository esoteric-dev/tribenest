import { z } from "zod";

export const createScheduledStreamSchema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(200),
  videoFilename: z.string().min(1),
  videoUrl: z.string().url(),
  scheduledAt: z.string().datetime(),
});

export const getPresignedUrlSchema = z.object({
  profileId: z.string().uuid(),
  filename: z.string().min(1),
});

export type CreateScheduledStreamInput = z.infer<typeof createScheduledStreamSchema>;
export type GetPresignedUrlInput = z.infer<typeof getPresignedUrlSchema>;
