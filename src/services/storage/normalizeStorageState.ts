import type { StorageBucketsState } from '../../models/shared/storageBucketsState.js';

export function normalizeStorageState(state?: StorageBucketsState): StorageBucketsState {
  if (!state) {
    return { buckets: {} };
  }
  return { buckets: state.buckets ?? {} };
}
