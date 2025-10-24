import { AzionBucketPayload } from '../../models/azionBucketPayload.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';

export function buildBucketRecord(payload: AzionBucketPayload): StorageBucketRecord {
  return {
    id: payload.id,
    name: payload.name,
    edgeAccess: payload.edge_access,
    description: payload.description,
    region: payload.region,
    createdAt: typeof payload.created_at === 'string' ? payload.created_at : new Date().toISOString(),
    raw: payload,
  };
}
