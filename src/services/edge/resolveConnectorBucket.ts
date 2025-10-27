import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import { resolveBucketReference } from '../storage/index.js';

export async function resolveConnectorBucket(ref: { bucketId?: string; bucketName?: string }): Promise<StorageBucketRecord> {
  if (!ref.bucketId && !ref.bucketName) {
    throw new Error('Bucket não informado.');
  }
  return await resolveBucketReference(ref);
}
