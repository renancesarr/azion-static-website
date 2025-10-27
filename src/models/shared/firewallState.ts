import type { FirewallRecordData } from './firewallRecordData.js';

export interface FirewallState {
  firewalls: Record<string, FirewallRecordData>;
}
