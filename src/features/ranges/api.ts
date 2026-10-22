import { z } from 'zod';
import { apiRequest } from '../../lib/api/client.js';

const rangeActionSchema = z.object({
  handClass: z.string(),
  actionType: z.string(),
  sizing: z.number().nullable().optional(),
  frequency: z.number(),
  evNullable: z.number().nullable().optional(),
  unitNullable: z.string().nullable().optional(),
});

const rangeNodeSchema = z.object({
  nodeKey: z.string(),
  actions: z.array(rangeActionSchema),
});

const rangeSourceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  method: z.string(),
  rightsVerified: z.boolean(),
});

export const preflopRangeResponseSchema = z.object({
  query: z.object({
    format: z.string(),
    valuation: z.string(),
    street: z.string(),
    tableSize: z.number(),
    position: z.string().nullable().optional(),
    vsPosition: z.string().nullable().optional(),
    scenario: z.string().nullable().optional(),
  }),
  spot: z.object({
    id: z.string(),
    spotKey: z.string(),
    format: z.string(),
    valuation: z.string(),
    street: z.string(),
    tableSize: z.number(),
  }),
  version: z.object({
    id: z.string(),
    versionTag: z.string(),
    model: z.string(),
    checksum: z.string(),
    publishedAt: z.string().nullable().optional(),
    source: rangeSourceSchema,
  }),
  nodes: z.array(rangeNodeSchema),
});

export type PreflopRangeResponse = z.infer<typeof preflopRangeResponseSchema>;
export type RangeAction = z.infer<typeof rangeActionSchema>;

export async function fetchPreflopRange(params: {
  format: string;
  valuation: string;
  street: string;
  tableSize: number;
  position?: string;
  vsPosition?: string;
  scenario?: string;
}) {
  const query = new URLSearchParams({
    format: params.format,
    valuation: params.valuation,
    street: params.street,
    tableSize: String(params.tableSize),
  });
  if (params.position) query.set('position', params.position);
  if (params.vsPosition) query.set('vsPosition', params.vsPosition);
  if (params.scenario) query.set('scenario', params.scenario);

  const response = await apiRequest<unknown>(`/api/ranges/preflop?${query.toString()}` as `/api/${string}`);
  return preflopRangeResponseSchema.parse(response);
}
