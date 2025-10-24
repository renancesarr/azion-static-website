import { readStateFile, writeStateFile } from '../../utils/state.js';
import { FirewallRecord } from '../../models/firewallRecord.js';
import { FirewallState } from '../../models/firewallState.js';
import { FIREWALL_STATE_FILE } from './constants.js';
import { normalizeFirewallState } from './normalizeFirewallState.js';

export async function persistFirewall(record: FirewallRecord): Promise<FirewallRecord> {
  const current = normalizeFirewallState(await readStateFile<FirewallState>(FIREWALL_STATE_FILE));
  current.firewalls[record.name] = record;
  await writeStateFile(FIREWALL_STATE_FILE, current);
  return record;
}
