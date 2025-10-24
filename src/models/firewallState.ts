import { FirewallRecord } from './firewallRecord.js';

export interface FirewallState {
  firewalls: Record<string, FirewallRecord>;
}
