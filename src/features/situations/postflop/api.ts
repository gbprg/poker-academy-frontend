import { z } from 'zod';
import { apiRequest } from '../../../lib/api/client.js';

const treeItemSchema = z.object({
  spot: z.object({
    id: z.string(),
    spotKey: z.string(),
    street: z.string(),
    board: z.array(z.object({ rank: z.string(), suit: z.string() })).optional(),
  }),
  version: z.object({ id: z.string(), versionTag: z.string(), sourceId: z.string() }),
  nodeCount: z.number(),
});

export const postflopTreesResponseSchema = z.object({
  available: z.boolean(),
  items: z.array(treeItemSchema),
});

export type PostflopTreesResponse = z.infer<typeof postflopTreesResponseSchema>;

const nodeActionSchema = z.object({
  handClass: z.string(),
  actionType: z.string(),
  sizing: z.number().nullable().optional(),
  frequency: z.number(),
  evNullable: z.number().nullable().optional(),
  unitNullable: z.string().nullable().optional(),
});

export const postflopNodeResponseSchema = z.object({
  nodeKey: z.string(),
  strategyVersionId: z.string(),
  spot: z.object({
    id: z.string(),
    spotKey: z.string(),
    street: z.string(),
    board: z.array(z.object({ rank: z.string(), suit: z.string() })).optional(),
  }),
  actions: z.array(nodeActionSchema),
});

export type PostflopNodeResponse = z.infer<typeof postflopNodeResponseSchema>;

export async function fetchPostflopTrees(params: { format: string; valuation: string; street: string; tableSize: number }) {
  const query = new URLSearchParams({
    format: params.format,
    valuation: params.valuation,
    street: params.street,
    tableSize: String(params.tableSize),
  });
  const response = await apiRequest<unknown>(`/api/strategy/postflop/trees?${query.toString()}` as `/api/${string}`);
  return postflopTreesResponseSchema.parse(response);
}

export async function fetchPostflopNode(nodeId: string) {
  const query = new URLSearchParams({ nodeId });
  const response = await apiRequest<unknown>(`/api/strategy/postflop/node?${query.toString()}` as `/api/${string}`);
  return postflopNodeResponseSchema.parse(response);
}
