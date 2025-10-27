import type { WafRulesetState } from '../../models/shared/wafRulesetState.js';

export function normalizeWafRulesetState(state?: WafRulesetState): WafRulesetState {
  if (!state) {
    return { rulesets: {} };
  }
  return { rulesets: state.rulesets ?? {} };
}
