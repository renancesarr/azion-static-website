import type { AzionConnector } from '../../models/dto/azionConnector.js';
import { EdgeConnectorRecord } from '../../models/entities/edgeConnectorRecord.js';

export function buildConnectorRecord(payload: AzionConnector, bucketId: string, bucketName?: string): EdgeConnectorRecord {
  return EdgeConnectorRecord.fromAzionPayload(payload, bucketId, bucketName);
}
