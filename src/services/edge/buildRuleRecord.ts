import type { AzionRule } from '../../models/dto/azionRule.js';
import { EdgeRuleRecord } from '../../models/entities/edgeRuleRecord.js';

export function buildRuleRecord(payload: AzionRule, edgeApplicationId: string): EdgeRuleRecord {
  return EdgeRuleRecord.fromAzionPayload(payload, edgeApplicationId);
}
