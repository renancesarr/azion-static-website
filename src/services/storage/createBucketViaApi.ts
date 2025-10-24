import { HttpError } from '../../utils/http.js';
import { AzionBucketPayload } from '../../models/azionBucketPayload.js';
import { AzionCreateBucketResponse } from '../../models/azionCreateBucketResponse.js';
import { CreateBucketInput } from './schemas.js';
import { persistBucket } from './persistBucket.js';
import { buildBucketRecord } from './buildBucketRecord.js';
import { defaultStorageDependencies } from './dependencies.js';
import type { StorageDependencies } from './types.js';
import { findBucketByNameApi } from './findBucketByNameApi.js';

export async function createBucketViaApi(
  input: CreateBucketInput,
  deps: StorageDependencies = defaultStorageDependencies,
) {
  try {
    const response = await deps.http<AzionCreateBucketResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/storage/buckets`,
      body: {
        name: input.name,
        edge_access: input.edgeAccess,
        description: input.description,
        region: input.region,
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionBucketPayload);
    return await persistBucket(buildBucketRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findBucketByNameApi(input.name, deps);
      if (existing) {
        return await persistBucket(buildBucketRecord(existing));
      }
    }
    throw error;
  }
}
