import { readStateFile, writeStateFile } from '../../utils/state.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { StorageBucketsState } from '../../models/storageBucketsState.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';

export async function persistBucket(bucket: StorageBucketRecord): Promise<StorageBucketRecord> {
  const current = normalizeStorageState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  const existing = current.buckets[bucket.name];
  const record: StorageBucketRecord = existing
    ? {
        ...existing,
        ...bucket,
        createdAt: existing.createdAt ?? bucket.createdAt,
      }
    : bucket;
  current.buckets[record.name] = record;
  await writeStateFile(STORAGE_STATE_FILE, current);
  return record;
}
