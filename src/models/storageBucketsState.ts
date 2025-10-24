import { StorageBucketRecord } from './storageBucketRecord.js';

export interface StorageBucketsState {
  buckets: Record<string, StorageBucketRecord>;
}
