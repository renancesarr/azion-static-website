import { AzionConnector } from '../../models/azionConnector.js';
import { EdgeConnectorRecord } from '../../models/edgeConnectorRecord.js';

export function buildConnectorRecord(payload: AzionConnector, bucketId: string, bucketName?: string): EdgeConnectorRecord {
  return {
    id: payload.id,
    name: payload.name,
    bucketId,
    bucketName: bucketName ?? payload.bucket?.name,
    originPath: payload.origin_path,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
