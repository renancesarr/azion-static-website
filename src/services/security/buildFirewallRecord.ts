import { AzionFirewall } from '../../models/azionFirewall.js';
import { FirewallRecord } from '../../models/firewallRecord.js';

export function buildFirewallRecord(payload: AzionFirewall): FirewallRecord {
  return {
    id: payload.id,
    name: payload.name,
    domainIds: payload.domains ?? [],
    isActive: payload.is_active ?? true,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
