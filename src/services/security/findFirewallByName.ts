import { FirewallRecord } from '../../models/firewallRecord.js';
import { FirewallState } from '../../models/firewallState.js';
import { FIREWALL_STATE_FILE } from './constants.js';
import { normalizeFirewallState } from './normalizeFirewallState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findFirewallByName(
  state: StateRepository,
  name: string,
): Promise<FirewallRecord | undefined> {
  const current = normalizeFirewallState(await state.read<FirewallState>(FIREWALL_STATE_FILE));
  return current.firewalls[name];
}
