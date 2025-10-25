import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { StorageBucketsState } from '../../models/storageBucketsState.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistBucket(state: StateRepository, bucket: StorageBucketRecord): Promise<StorageBucketRecord> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  const existing = current.buckets[bucket.name];
  const record: StorageBucketRecord = existing
    ? {
        ...existing,
        ...bucket,
        createdAt: existing.createdAt ?? bucket.createdAt,
      }
    : bucket;
  current.buckets[record.name] = record;
  await state.write(STORAGE_STATE_FILE, current);
  return record;
}
