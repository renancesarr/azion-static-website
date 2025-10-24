import { HttpError } from '../../utils/http.js';
import { AzionFirewallRule } from '../../models/azionFirewallRule.js';
import { AzionFirewallRuleResponse } from '../../models/azionFirewallRuleResponse.js';
import { ApplyWafRulesetInput } from './schemas.js';
import { buildFirewallRuleBinding } from './buildFirewallRuleBinding.js';
import { persistFirewallRule } from './persistFirewallRule.js';
import { fetchFirewallRulesApi } from './fetchFirewallRulesApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function applyWafRulesetViaApi(
  input: ApplyWafRulesetInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
) {
  try {
    const response = await deps.http<AzionFirewallRuleResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/edge_firewall/firewalls/${encodeURIComponent(input.firewallId)}/rules`,
      body: {
        name: `waf-${input.rulesetId}`,
        order: input.order,
        is_active: true,
        behaviors: [
          {
            name: 'waf',
            target: input.rulesetId,
          },
        ],
        criteria: [
          {
            name: 'all',
            arguments: ['*'],
          },
        ],
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionFirewallRule);
    return await persistFirewallRule(buildFirewallRuleBinding(payload, input.firewallId, input.rulesetId));
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existingRules = await fetchFirewallRulesApi(input.firewallId, deps);
      const match = existingRules.find((rule) => JSON.stringify(rule.behaviors).includes(input.rulesetId));
      if (match) {
        return await persistFirewallRule(buildFirewallRuleBinding(match, input.firewallId, input.rulesetId));
      }
    }
    throw error;
  }
}
