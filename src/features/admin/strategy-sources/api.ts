import { z } from 'zod';

export const strategySourceMethodSchema = z.enum(['SOLVER_VERIFIED', 'LICENSED', 'EDITORIAL', 'DEMO_NOT_GTO']);

export const sourceLicenseSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  licenseName: z.string(),
  licenseUrl: z.string().nullable().optional(),
  terms: z.string(),
  authorizationId: z.string().nullable().optional(),
  checksum: z.string(),
  capturedAt: z.string(),
});

export const strategySourceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  originUrl: z.string().nullable().optional(),
  method: strategySourceMethodSchema,
  rightsVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  licenses: z.array(sourceLicenseSchema).optional(),
});

export type StrategySource = z.infer<typeof strategySourceSchema>;
export type SourceMethod = z.infer<typeof strategySourceMethodSchema>;

export const createSourceSchema = z.object({
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífens'),
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  author: z.string().min(2, 'Mínimo 2 caracteres'),
  originUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  method: strategySourceMethodSchema,
});

export type CreateSourceValues = z.infer<typeof createSourceSchema>;

export const addLicenseSchema = z.object({
  licenseName: z.string().min(3, 'Mínimo 3 caracteres'),
  licenseUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  terms: z.string().min(10, 'Mínimo 10 caracteres'),
  authorizationId: z.string().optional().or(z.literal('')),
  checksum: z.string().regex(/^[a-f0-9]{64}$/i, 'Checksum SHA256 deve ter 64 caracteres hexadecimais'),
});

export type AddLicenseValues = z.infer<typeof addLicenseSchema>;

export const importIssueSchema = z.object({
  path: z.string(),
  code: z.string(),
  message: z.string(),
});

export const importReportSchema = z.object({
  ok: z.boolean(),
  source: z.object({ slug: z.string(), method: z.string() }).optional(),
  counts: z.object({
    spots: z.number(),
    strategyVersions: z.number(),
    decisionNodes: z.number(),
  }),
  issues: z.array(importIssueSchema),
});

export type ImportIssue = z.infer<typeof importIssueSchema>;
export type ImportReport = z.infer<typeof importReportSchema>;

export const previewResultSchema = z.object({
  sourceId: z.string(),
  persisted: z.literal(false),
  report: importReportSchema,
});

export type PreviewResult = z.infer<typeof previewResultSchema>;

export const commitResultSchema = importReportSchema.extend({
  persisted: z.literal(true),
  created: z.object({
    spots: z.number(),
    versions: z.number(),
    nodes: z.number(),
    actions: z.number(),
  }),
  skipped: z.object({
    spots: z.number(),
    versions: z.number(),
  }),
});

export type CommitResult = z.infer<typeof commitResultSchema>;

export const listSourcesResponseSchema = z.object({
  items: z.array(strategySourceSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
