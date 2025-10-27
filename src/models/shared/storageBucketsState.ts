import type { StorageBucketRecordData } from './storageBucketRecordData.js';

export interface StorageBucketsState {
  buckets: Record<string, StorageBucketRecordData>;
}
