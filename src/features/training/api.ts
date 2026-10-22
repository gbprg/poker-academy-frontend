import { z } from 'zod';
import { apiRequest } from '../../lib/api/client.js';

export const createTrainingSessionSchema = z.object({
  spotId: z.string(),
  strategyVersionId: z.string(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionSchema>;

export const trainingSessionSchema = z.object({
  id: z.string(),
  spotId: z.string(),
  strategyVersionId: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type TrainingSession = z.infer<typeof trainingSessionSchema>;

export async function createTrainingSession(input: CreateTrainingSessionInput): Promise<TrainingSession> {
  const response = await apiRequest<unknown>('/api/training/sessions' as `/api/${string}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return trainingSessionSchema.parse((response as { session?: unknown }).session ?? response);
}
