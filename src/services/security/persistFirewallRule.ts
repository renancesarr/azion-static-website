import { FirewallRuleBinding } from '../../models/entities/firewallRuleBinding.js';
import { FirewallRuleState } from '../../models/shared/firewallRuleState.js';
import { FIREWALL_RULE_STATE_FILE } from './constants.js';
import { normalizeFirewallRuleState } from './normalizeFirewallRuleState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

function bindingKey(firewallId: string, rulesetId: string): string {
  return `${firewallId}:${rulesetId}`;
}

export async function persistFirewallRule(
  state: StateRepository,
  record: FirewallRuleBinding,
): Promise<FirewallRuleBinding> {
  const current = normalizeFirewallRuleState(await state.read<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  current.bindings[bindingKey(record.firewallId, record.rulesetId)] = record.toJSON();
  await state.write(FIREWALL_RULE_STATE_FILE, current);
  return record;
}

export async function findFirewallRuleBindingFromState(
  state: StateRepository,
  firewallId: string,
  rulesetId: string,
): Promise<FirewallRuleBinding | undefined> {
  const current = normalizeFirewallRuleState(await state.read<FirewallRuleState>(FIREWALL_RULE_STATE_FILE));
  const record = current.bindings[bindingKey(firewallId, rulesetId)];
  if (!record) {
    return undefined;
  }
  return FirewallRuleBinding.hydrate(record);
}
