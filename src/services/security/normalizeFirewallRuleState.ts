import type { FirewallRuleState } from '../../models/shared/firewallRuleState.js';

export function normalizeFirewallRuleState(state?: FirewallRuleState): FirewallRuleState {
  if (!state) {
    return { bindings: {} };
  }
  return { bindings: state.bindings ?? {} };
}
