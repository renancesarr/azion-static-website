import { FirewallRecord } from '../../models/entities/firewallRecord.js';
import type { FirewallState } from '../../models/shared/firewallState.js';
import { FIREWALL_STATE_FILE } from './constants.js';
import { normalizeFirewallState } from './normalizeFirewallState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findFirewallByName(
  state: StateRepository,
  name: string,
): Promise<FirewallRecord | undefined> {
  const current = normalizeFirewallState(await state.read<FirewallState>(FIREWALL_STATE_FILE));
  const record = current.firewalls[name];
  if (!record) {
    return undefined;
  }
  return FirewallRecord.hydrate(record);
}
