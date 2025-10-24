import { FirewallState } from '../../models/firewallState.js';

export function normalizeFirewallState(state?: FirewallState): FirewallState {
  if (!state) {
    return { firewalls: {} };
  }
  return { firewalls: state.firewalls ?? {} };
}
