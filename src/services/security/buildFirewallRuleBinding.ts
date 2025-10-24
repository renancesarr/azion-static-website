import { AzionFirewallRule } from '../../models/azionFirewallRule.js';
import { FirewallRuleBinding } from '../../models/firewallRuleBinding.js';

export function buildFirewallRuleBinding(
  payload: AzionFirewallRule,
  firewallId: string,
  rulesetId: string,
): FirewallRuleBinding {
  return {
    id: payload.id,
    firewallId,
    rulesetId,
    order: payload.order,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
