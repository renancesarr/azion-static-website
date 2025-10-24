import { AzionWafPolicy } from '../../models/azionWafPolicy.js';
import { WafPolicyRecord } from '../../models/wafPolicyRecord.js';

export function buildWafRecord(payload: AzionWafPolicy): WafPolicyRecord {
  return {
    edgeApplicationId: payload.edge_application_id,
    wafId: payload.id,
    mode: payload.mode,
    enabled: payload.enabled,
    updatedAt: payload.updated_at ?? new Date().toISOString(),
    raw: payload,
  };
}
