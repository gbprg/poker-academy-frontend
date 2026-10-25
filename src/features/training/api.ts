import { z } from 'zod';
import { apiRequest } from '../../lib/api/client.js';

const trainingSessionSummarySchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  totalQuestions: z.number(),
});

const questionContextSchema = z.object({
  spotKey: z.string(),
  format: z.string(),
  valuation: z.string(),
  street: z.string(),
  tableSize: z.number(),
  nodeKey: z.string().nullable(),
  blinds: z.unknown().nullable(),
  seats: z.unknown().nullable(),
  hero: z.unknown().nullable(),
  board: z.unknown().nullable(),
  history: z.unknown().nullable(),
  pot: z.unknown().nullable(),
  legalActions: z.array(z.string()).nullable(),
});

const deliveredQuestionSchema = z.object({
  id: z.string(),
  position: z.number(),
  answered: z.boolean(),
  context: questionContextSchema,
});

export const createSessionResponseSchema = z.object({
  session: trainingSessionSummarySchema,
  question: deliveredQuestionSchema.optional(),
});

const sessionQuestionListSchema = z.object({
  session: trainingSessionSummarySchema,
  questions: z.array(
    z.object({ id: z.string(), position: z.number(), answered: z.boolean() }),
  ),
});

const questionResponseSchema = z.object({
  question: deliveredQuestionSchema,
});

const answerFeedbackSchema = z.object({
  duplicate: z.boolean(),
  answer: z.object({ actionType: z.string(), sizing: z.number().nullable() }),
  score: z.number(),
  evDelta: z.number().nullable(),
  bestActionType: z.string().nullable(),
  mix: z.array(z.object({ actionType: z.string(), frequency: z.number() })),
  scoringVersion: z.string(),
});

const completionResponseSchema = z.object({
  session: z.object({
    id: z.string(),
    status: z.string(),
    createdAt: z.string(),
    completedAt: z.string(),
    alreadyCompleted: z.boolean(),
  }),
  totalQuestions: z.number(),
  answeredQuestions: z.number(),
  partial: z.boolean(),
  averageScore: z.number().nullable(),
  averageEvDelta: z.number().nullable(),
  results: z.array(
    z.object({
      position: z.number(),
      spotKey: z.string().nullable(),
      strategyVersionId: z.string(),
      answered: z.boolean(),
      actionType: z.string().nullable(),
      score: z.number().nullable(),
      evDelta: z.number().nullable(),
      scoringVersion: z.string().nullable(),
    }),
  ),
});

const historyResponseSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      createdAt: z.string(),
      completedAt: z.string().nullable(),
      totalQuestions: z.number(),
      answeredQuestions: z.number(),
      averageScore: z.number().nullable(),
    }),
  ),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
export type DeliveredQuestion = z.infer<typeof deliveredQuestionSchema>;
export type AnswerFeedback = z.infer<typeof answerFeedbackSchema>;
export type CompletionResponse = z.infer<typeof completionResponseSchema>;
export type TrainingHistory = z.infer<typeof historyResponseSchema>;

export async function createTrainingSession(input: {
  spotId?: string;
  strategyVersionId?: string;
  filters?: Record<string, unknown>;
  scenario?: Record<string, unknown>;
}) {
  const response = await apiRequest<unknown>('/api/training/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return createSessionResponseSchema.parse(response);
}

export async function fetchTrainingQuestion(sessionId: string, position: number) {
  const response = await apiRequest<unknown>(
    `/api/training/sessions/${sessionId}/questions/${position}`,
  );
  return questionResponseSchema.parse(response).question;
}

export async function fetchTrainingSession(sessionId: string) {
  const response = await apiRequest<unknown>(`/api/training/sessions/${sessionId}`);
  return sessionQuestionListSchema.parse(response);
}

export async function submitTrainingAnswer(
  sessionId: string,
  position: number,
  input: { actionType: string; sizing?: number; idempotencyKey: string },
) {
  const response = await apiRequest<unknown>(
    `/api/training/sessions/${sessionId}/questions/${position}/answers`,
    { method: 'POST', body: JSON.stringify(input) },
  );
  return answerFeedbackSchema.parse(response);
}

export async function completeTrainingSession(sessionId: string) {
  const response = await apiRequest<unknown>(`/api/training/sessions/${sessionId}/complete`, {
    method: 'POST',
  });
  return completionResponseSchema.parse(response);
}

export async function fetchTrainingHistory() {
  const response = await apiRequest<unknown>('/api/training/history');
  return historyResponseSchema.parse(response);
}

const trainingPresetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  filters: z.unknown(),
  scenario: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const presetsResponseSchema = z.object({ presets: z.array(trainingPresetSchema) });
const presetResponseSchema = z.object({ preset: trainingPresetSchema });

export type TrainingPreset = z.infer<typeof trainingPresetSchema>;

export async function fetchPresets() {
  const response = await apiRequest<unknown>('/api/training/presets');
  return presetsResponseSchema.parse(response);
}

export async function createPreset(input: { name: string; filters: Record<string, unknown>; scenario?: Record<string, unknown> }) {
  const response = await apiRequest<unknown>('/api/training/presets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return presetResponseSchema.parse(response);
}

export async function deletePreset(presetId: string) {
  await apiRequest<unknown>(`/api/training/presets/${presetId}`, { method: 'DELETE' });
}

const eligibleCountResponseSchema = z.object({
  eligible: z.number(),
  count: z.number().optional(),
});

export type EligibleCountResponse = z.infer<typeof eligibleCountResponseSchema>;

export async function fetchEligibleCount(input: {
  spotId?: string;
  strategyVersionId?: string;
  filters?: Record<string, unknown>;
}) {
  const response = await apiRequest<unknown>('/api/training/eligible-count', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return eligibleCountResponseSchema.parse(response);
}

const analyticsOverviewSchema = z.object({
  sessions: z.number(),
  attempts: z.number(),
  completedSessions: z.number(),
  correctAttempts: z.number(),
  accuracy: z.number(),
});
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

export async function fetchAnalyticsOverview() {
  const response = await apiRequest<unknown>('/api/analytics/overview');
  return analyticsOverviewSchema.parse(response);
}
