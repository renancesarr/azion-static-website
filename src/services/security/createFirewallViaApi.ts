import { HttpError } from '../../utils/http.js';
import { AzionFirewall } from '../../models/azionFirewall.js';
import { AzionFirewallResponse } from '../../models/azionFirewallResponse.js';
import { CreateFirewallInput } from './schemas.js';
import { resolveDomainIds } from './resolveDomainIds.js';
import { buildFirewallRecord } from './buildFirewallRecord.js';
import { persistFirewall } from './persistFirewall.js';
import { fetchFirewallByNameApi } from './fetchFirewallByNameApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function createFirewallViaApi(
  input: CreateFirewallInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
) {
  const domainIds = await resolveDomainIds(input);

  try {
    const response = await deps.http<AzionFirewallResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/edge_firewall/firewalls`,
      body: {
        name: input.name,
        domains: domainIds,
        is_active: input.isActive ?? true,
        waf: {
          active: true,
        },
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionFirewall);
    return await persistFirewall(buildFirewallRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchFirewallByNameApi(input.name, deps);
      if (existing) {
        return await persistFirewall(buildFirewallRecord(existing));
      }
    }
    throw error;
  }
}
