import type { EdgeRuleState } from '../../models/shared/edgeRuleState.js';

export function normalizeRuleState(state?: EdgeRuleState): EdgeRuleState {
  if (!state) {
    return { rules: {} };
  }
  return { rules: state.rules ?? {} };
}
