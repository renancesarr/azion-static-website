import { readStateFile } from '../../utils/state.js';
import { WafRulesetRecord } from '../../models/wafRulesetRecord.js';
import { WafRulesetState } from '../../models/wafRulesetState.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';
import { normalizeWafRulesetState } from './normalizeWafRulesetState.js';

export async function findWafRulesetByName(name: string): Promise<WafRulesetRecord | undefined> {
  const current = normalizeWafRulesetState(await readStateFile<WafRulesetState>(WAF_RULESET_STATE_FILE));
  return current.rulesets[name];
}
