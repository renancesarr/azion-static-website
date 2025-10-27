import { AzionWafRuleset } from '../../models/dto/azionWafRuleset.js';
import { AzionWafRulesetListResponse } from '../../models/dto/azionWafRulesetListResponse.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function fetchWafRulesetByNameApi(
  name: string,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<AzionWafRuleset | undefined> {
  const response = await deps.http.request<AzionWafRulesetListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/waf/rulesets?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((ruleset: AzionWafRuleset) => ruleset.name === name);
}
