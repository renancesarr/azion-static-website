import { readStateFile } from '../../utils/state.js';
import { FirewallRecord } from '../../models/firewallRecord.js';
import { FirewallState } from '../../models/firewallState.js';
import { FIREWALL_STATE_FILE } from './constants.js';
import { normalizeFirewallState } from './normalizeFirewallState.js';

export async function findFirewallByName(name: string): Promise<FirewallRecord | undefined> {
  const current = normalizeFirewallState(await readStateFile<FirewallState>(FIREWALL_STATE_FILE));
  return current.firewalls[name];
}
