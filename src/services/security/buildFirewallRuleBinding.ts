import { AzionFirewallRule } from '../../models/dto/azionFirewallRule.js';
import { FirewallRuleBinding } from '../../models/entities/firewallRuleBinding.js';

export function buildFirewallRuleBinding(
  payload: AzionFirewallRule,
  firewallId: string,
  rulesetId: string,
): FirewallRuleBinding {
  return FirewallRuleBinding.create({
    id: payload.id,
    firewallId,
    rulesetId,
    order: payload.order,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  });
}
