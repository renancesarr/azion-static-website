import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { lookupBucketById, lookupBucketByName } from './lookupBucket.js';
import { persistBucket } from './persistBucket.js';
import { buildBucketRecord } from './buildBucketRecord.js';
import { findBucketByNameApi } from './findBucketByNameApi.js';
import { fetchBucketByIdApi } from './fetchBucketByIdApi.js';
import type { StorageDependencies } from './types.js';
import { defaultStorageDependencies } from './dependencies.js';

export async function resolveBucketReference(
  ref: { bucketId?: string; bucketName?: string },
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<StorageBucketRecord> {
  if (ref.bucketId) {
    const cached = await lookupBucketById(ref.bucketId);
    if (cached) {
      return cached;
    }
    const apiBucket = await fetchBucketByIdApi(ref.bucketId, deps);
    if (!apiBucket) {
      throw new Error(`Bucket com id ${ref.bucketId} não localizado na API Azion.`);
    }
    return await persistBucket(buildBucketRecord(apiBucket));
  }

  if (ref.bucketName) {
    const cached = await lookupBucketByName(ref.bucketName);
    if (cached) {
      return cached;
    }
    const apiBucket = await findBucketByNameApi(ref.bucketName, deps);
    if (!apiBucket) {
      throw new Error(`Bucket com nome ${ref.bucketName} não localizado na API Azion.`);
    }
    return await persistBucket(buildBucketRecord(apiBucket));
  }

  throw new Error('Referência de bucket ausente.');
}
