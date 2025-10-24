import { readStateFile } from '../../utils/state.js';
import { StorageBucketsState } from '../../models/storageBucketsState.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { STORAGE_STATE_FILE } from './constants.js';
import { normalizeStorageState } from './normalizeStorageState.js';

export async function lookupBucketByName(name: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  return current.buckets[name];
}

export async function lookupBucketById(id: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeStorageState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  return Object.values(current.buckets).find((bucket) => bucket.id === id);
}
