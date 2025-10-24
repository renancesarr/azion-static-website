import { AzionEdgeApplication } from '../../models/azionEdgeApplication.js';
import { EdgeApplicationRecord } from '../../models/edgeApplicationRecord.js';

export function buildEdgeApplicationRecord(payload: AzionEdgeApplication): EdgeApplicationRecord {
  return {
    id: payload.id,
    name: payload.name,
    deliveryProtocol: payload.delivery_protocol,
    originProtocol: payload.origin_protocol_policy,
    caching: payload.caching ?? {},
    enableWaf: payload.waf?.active ?? false,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
