import { AzionWafRuleset } from '../../models/azionWafRuleset.js';
import { WafRulesetRecord } from '../../models/entities/wafRulesetRecord.js';

export function buildWafRulesetRecord(payload: AzionWafRuleset): WafRulesetRecord {
  return WafRulesetRecord.create({
    id: payload.id,
    name: payload.name,
    mode: payload.mode,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  });
}
