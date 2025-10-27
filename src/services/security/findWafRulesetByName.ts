import { WafRulesetRecord } from '../../models/entities/wafRulesetRecord.js';
import type { WafRulesetState } from '../../models/shared/wafRulesetState.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';
import { normalizeWafRulesetState } from './normalizeWafRulesetState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findWafRulesetByName(
  state: StateRepository,
  name: string,
): Promise<WafRulesetRecord | undefined> {
  const current = normalizeWafRulesetState(await state.read<WafRulesetState>(WAF_RULESET_STATE_FILE));
  const record = current.rulesets[name];
  if (!record) {
    return undefined;
  }
  return WafRulesetRecord.hydrate(record);
}
