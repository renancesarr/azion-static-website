import { WafRulesetRecord } from '../../models/wafRulesetRecord.js';
import { WafRulesetState } from '../../models/wafRulesetState.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';
import { normalizeWafRulesetState } from './normalizeWafRulesetState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findWafRulesetByName(
  state: StateRepository,
  name: string,
): Promise<WafRulesetRecord | undefined> {
  const current = normalizeWafRulesetState(await state.read<WafRulesetState>(WAF_RULESET_STATE_FILE));
  return current.rulesets[name];
}
