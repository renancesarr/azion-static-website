import { AzionRule } from '../../models/azionRule.js';
import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';

export function buildRuleRecord(payload: AzionRule, edgeApplicationId: string): EdgeRuleRecord {
  return {
    id: payload.id,
    edgeApplicationId,
    phase: payload.phase,
    order: payload.order,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
