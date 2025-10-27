import type { StorageBucketsState } from '../../models/shared/storageBucketsState.js';
import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function lookupBucketByName(state: StateRepository, name: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  const record = current.buckets[name];
  if (!record) {
    return undefined;
  }
  return StorageBucketRecord.hydrate(record);
}

export async function lookupBucketById(state: StateRepository, id: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  const record = Object.values(current.buckets).find((bucket) => bucket.id === id);
  if (!record) {
    return undefined;
  }
  return StorageBucketRecord.hydrate(record);
}
