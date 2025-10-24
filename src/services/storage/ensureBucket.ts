import type { EnsureResult } from '../../utils/ensure.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { CreateBucketInput } from './schemas.js';
import { lookupBucketByName } from './lookupBucket.js';
import { createBucketViaApi } from './createBucketViaApi.js';
import type { StorageDependencies } from './types.js';
import { defaultStorageDependencies } from './dependencies.js';

export async function ensureBucket(
  input: CreateBucketInput,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<EnsureResult<StorageBucketRecord>> {
  const existing = await lookupBucketByName(input.name);
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await createBucketViaApi(input, deps);
  return { record, created: true };
}
