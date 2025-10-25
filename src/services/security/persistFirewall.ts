import { FirewallRecord } from '../../models/firewallRecord.js';
import { FirewallState } from '../../models/firewallState.js';
import { FIREWALL_STATE_FILE } from './constants.js';
import { normalizeFirewallState } from './normalizeFirewallState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistFirewall(
  state: StateRepository,
  record: FirewallRecord,
): Promise<FirewallRecord> {
  const current = normalizeFirewallState(await state.read<FirewallState>(FIREWALL_STATE_FILE));
  current.firewalls[record.name] = record;
  await state.write(FIREWALL_STATE_FILE, current);
  return record;
}
