import { WafRulesetRecord } from '../../models/entities/wafRulesetRecord.js';
import { WafRulesetState } from '../../models/shared/wafRulesetState.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';
import { normalizeWafRulesetState } from './normalizeWafRulesetState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistWafRuleset(
  state: StateRepository,
  record: WafRulesetRecord,
): Promise<WafRulesetRecord> {
  const current = normalizeWafRulesetState(await state.read<WafRulesetState>(WAF_RULESET_STATE_FILE));
  current.rulesets[record.name] = record.toJSON();
  await state.write(WAF_RULESET_STATE_FILE, current);
  return record;
}
