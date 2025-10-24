import { FirewallRuleBinding } from './firewallRuleBinding.js';

export interface FirewallRuleState {
  bindings: Record<string, FirewallRuleBinding>;
}
