import type { WafState } from '../../models/shared/wafState.js';

export function normalizeWafState(state?: WafState): WafState {
  if (!state) {
    return { policies: {} };
  }
  return { policies: state.policies ?? {} };
}
