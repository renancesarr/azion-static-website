import { StorageBucketsState } from '../../models/storageBucketsState.js';

export function normalizeStorageState(state?: StorageBucketsState): StorageBucketsState {
  if (!state) {
    return { buckets: {} };
  }
  return { buckets: state.buckets ?? {} };
}
