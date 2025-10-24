import { AzionWafRuleset } from '../../models/azionWafRuleset.js';
import { WafRulesetRecord } from '../../models/wafRulesetRecord.js';

export function buildWafRulesetRecord(payload: AzionWafRuleset): WafRulesetRecord {
  return {
    id: payload.id,
    name: payload.name,
    mode: payload.mode,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
