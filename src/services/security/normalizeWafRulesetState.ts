import { WafRulesetState } from '../../models/wafRulesetState.js';

export function normalizeWafRulesetState(state?: WafRulesetState): WafRulesetState {
  if (!state) {
    return { rulesets: {} };
  }
  return { rulesets: state.rulesets ?? {} };
}
