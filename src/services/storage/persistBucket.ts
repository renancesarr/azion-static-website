import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import type { StorageBucketsState } from '../../models/shared/storageBucketsState.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistBucket(state: StateRepository, bucket: StorageBucketRecord): Promise<StorageBucketRecord> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  const existing = current.buckets[bucket.name];
  const record = existing
    ? StorageBucketRecord.hydrate(existing).merge({
        id: bucket.id,
        edgeAccess: bucket.edgeAccess,
        description: bucket.description,
        region: bucket.region,
        createdAt: existing.createdAt ?? bucket.createdAt,
        raw: bucket.raw,
      })
    : bucket;
  current.buckets[record.name] = record.toJSON();
  await state.write(STORAGE_STATE_FILE, current);
  return record;
}
