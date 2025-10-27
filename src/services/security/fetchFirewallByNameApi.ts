import { AzionFirewall } from '../../models/dto/azionFirewall.js';
import { AzionFirewallListResponse } from '../../models/dto/azionFirewallListResponse.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function fetchFirewallByNameApi(
  name: string,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<AzionFirewall | undefined> {
  const response = await deps.http.request<AzionFirewallListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/edge_firewall/firewalls?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((fw: AzionFirewall) => fw.name === name);
}
