import { readStateFile, writeStateFile } from '../../utils/state.js';
import { WafRulesetRecord } from '../../models/wafRulesetRecord.js';
import { WafRulesetState } from '../../models/wafRulesetState.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';
import { normalizeWafRulesetState } from './normalizeWafRulesetState.js';

export async function persistWafRuleset(record: WafRulesetRecord): Promise<WafRulesetRecord> {
  const current = normalizeWafRulesetState(await readStateFile<WafRulesetState>(WAF_RULESET_STATE_FILE));
  current.rulesets[record.name] = record;
  await writeStateFile(WAF_RULESET_STATE_FILE, current);
  return record;
}
