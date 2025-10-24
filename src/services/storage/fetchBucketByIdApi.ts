import { HttpError } from '../../utils/http.js';
import { AzionBucketPayload } from '../../models/azionBucketPayload.js';
import { AzionBucketResponse } from '../../models/azionBucketResponse.js';
import type { StorageDependencies } from './types.js';
import { defaultStorageDependencies } from './dependencies.js';

export async function fetchBucketByIdApi(
  id: string,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<AzionBucketPayload | undefined> {
  try {
    const response = await deps.http<AzionBucketResponse>({
      method: 'GET',
      url: `${deps.apiBase}/v4/storage/buckets/${encodeURIComponent(id)}`,
    });
    return response.data.results ?? response.data.data ?? (response.data as unknown as AzionBucketPayload);
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}
