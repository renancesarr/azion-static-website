import { AzionBucketPayload } from '../../models/dto/azionBucketPayload.js';
import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';

export function buildBucketRecord(payload: AzionBucketPayload): StorageBucketRecord {
  return StorageBucketRecord.create({
    id: payload.id,
    name: payload.name,
    edgeAccess: payload.edge_access,
    description: payload.description,
    region: payload.region,
    createdAt: typeof payload.created_at === 'string' ? payload.created_at : new Date().toISOString(),
    raw: payload,
  });
}
