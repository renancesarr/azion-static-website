import type { FirewallRuleBindingData } from './firewallRuleBindingData.js';

export interface FirewallRuleState {
  bindings: Record<string, FirewallRuleBindingData>;
}
