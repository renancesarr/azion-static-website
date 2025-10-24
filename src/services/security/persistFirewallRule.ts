import { readStateFile, writeStateFile } from '../../utils/state.js';
import { FirewallRuleBinding } from '../../models/firewallRuleBinding.js';
import { FirewallRuleState } from '../../models/firewallRuleState.js';
import { FIREWALL_RULE_STATE_FILE } from './constants.js';
import { normalizeFirewallRuleState } from './normalizeFirewallRuleState.js';

function bindingKey(firewallId: string, rulesetId: string): string {
  return `${firewallId}:${rulesetId}`;
}

export async function persistFirewallRule(record: FirewallRuleBinding): Promise<FirewallRuleBinding> {
  const current = normalizeFirewallRuleState(await readStateFile<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  current.bindings[bindingKey(record.firewallId, record.rulesetId)] = record;
  await writeStateFile(FIREWALL_RULE_STATE_FILE, current);
  return record;
}

export async function findFirewallRuleBindingFromState(
  firewallId: string,
  rulesetId: string,
): Promise<FirewallRuleBinding | undefined> {
  const current = normalizeFirewallRuleState(await readStateFile<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  return current.bindings[bindingKey(firewallId, rulesetId)];
}
