import { FirewallRuleState } from '../../models/firewallRuleState.js';

export function normalizeFirewallRuleState(state?: FirewallRuleState): FirewallRuleState {
  if (!state) {
    return { bindings: {} };
  }
  return { bindings: state.bindings ?? {} };
}
