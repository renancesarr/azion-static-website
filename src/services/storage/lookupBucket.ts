import { StorageBucketsState } from '../../models/storageBucketsState.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function lookupBucketByName(state: StateRepository, name: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  return current.buckets[name];
}

export async function lookupBucketById(state: StateRepository, id: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await state.read<StorageBucketsState>(STORAGE_STATE_FILE));
  return Object.values(current.buckets).find((bucket) => bucket.id === id);
}
