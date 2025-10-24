import { AzionFirewallRule } from '../../models/azionFirewallRule.js';
import { AzionFirewallRuleListResponse } from '../../models/azionFirewallRuleListResponse.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function fetchFirewallRulesApi(
  firewallId: string,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<AzionFirewallRule[]> {
  const response = await deps.http<AzionFirewallRuleListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/edge_firewall/firewalls/${encodeURIComponent(firewallId)}/rules`,
  });
  return response.data.results ?? [];
}
