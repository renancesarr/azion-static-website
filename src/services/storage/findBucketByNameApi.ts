import { HttpError } from '../../utils/http.js';
import { AzionBucketPayload } from '../../models/azionBucketPayload.js';
import { AzionListBucketsResponse } from '../../models/azionListBucketsResponse.js';
import type { StorageDependencies } from './types.js';
import { defaultStorageDependencies } from './dependencies.js';

export async function findBucketByNameApi(
  name: string,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<AzionBucketPayload | undefined> {
  try {
    const response = await deps.http<AzionListBucketsResponse>({
      method: 'GET',
      url: `${deps.apiBase}/v4/storage/buckets?name=${encodeURIComponent(name)}`,
    });
    return response.data.results?.find((bucket) => bucket.name === name);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}
