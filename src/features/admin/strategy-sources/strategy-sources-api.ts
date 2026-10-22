import { apiRequest } from '../../../lib/api/client.js';
import {
  listSourcesResponseSchema,
  previewResultSchema,
  sourceLicenseSchema,
  strategySourceSchema,
  type AddLicenseValues,
  type CommitResult,
  type CreateSourceValues,
  type PreviewResult,
} from './api.js';

export type { StrategySource } from './api.js';
export type ListSourcesResponse = ReturnType<typeof listSourcesResponseSchema.parse>;

export async function listSources(params: { page?: number; pageSize?: number; method?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize));
  if (params.method) query.set('method', params.method);
  const path = (query.size > 0 ? `/api/admin/sources?${query.toString()}` : '/api/admin/sources') as `/api/${string}`;
  const response = await apiRequest<unknown>(path);
  return listSourcesResponseSchema.parse(response);
}

export async function createSource(input: CreateSourceValues) {
  const response = await apiRequest<unknown>('/api/admin/sources' as `/api/${string}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return strategySourceSchema.parse((response as { source: unknown }).source);
}

export async function addLicense(sourceId: string, input: AddLicenseValues) {
  const payload = {
    ...input,
    licenseUrl: input.licenseUrl || undefined,
    authorizationId: input.authorizationId || undefined,
  };
  const response = await apiRequest<unknown>(`/api/admin/sources/${sourceId}/licenses` as `/api/${string}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return sourceLicenseSchema.parse((response as { license: unknown }).license);
}

export async function verifyRights(sourceId: string) {
  const response = await apiRequest<unknown>(`/api/admin/sources/${sourceId}/verify-rights` as `/api/${string}`, {
    method: 'POST',
  });
  return strategySourceSchema.parse((response as { source: unknown }).source);
}

export async function previewImport(sourceId: string, bundle: string): Promise<PreviewResult> {
  const response = await apiRequest<unknown>('/api/admin/imports/preview' as `/api/${string}`, {
    method: 'POST',
    body: JSON.stringify({ sourceId, bundle }),
  });
  return previewResultSchema.parse(response);
}

export async function commitImport(sourceId: string, bundle: string): Promise<CommitResult> {
  const response = await apiRequest<unknown>('/api/admin/imports/commit' as `/api/${string}`, {
    method: 'POST',
    body: JSON.stringify({ sourceId, bundle }),
  });
  return (response as unknown) as CommitResult;
}
