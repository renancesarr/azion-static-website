import type { AzionEdgeApplication } from '../../models/dto/azionEdgeApplication.js';
import { EdgeApplicationRecord } from '../../models/entities/edgeApplicationRecord.js';

export function buildEdgeApplicationRecord(payload: AzionEdgeApplication): EdgeApplicationRecord {
  return EdgeApplicationRecord.fromAzionPayload(payload);
}
