import { HttpError } from '../../utils/http.js';
import { AzionWafRuleset } from '../../models/azionWafRuleset.js';
import { AzionWafRulesetResponse } from '../../models/azionWafRulesetResponse.js';
import { CreateWafRulesetInput } from './schemas.js';
import { buildWafRulesetRecord } from './buildWafRulesetRecord.js';
import { persistWafRuleset } from './persistWafRuleset.js';
import { fetchWafRulesetByNameApi } from './fetchWafRulesetByNameApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function createWafRulesetViaApi(
  input: CreateWafRulesetInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
) {
  try {
    const response = await deps.http.request<AzionWafRulesetResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/waf/rulesets`,
      body: {
        name: input.name,
        mode: input.mode,
        description: input.description,
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionWafRuleset);
    return await persistWafRuleset(deps.state, buildWafRulesetRecord(payload));
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchWafRulesetByNameApi(input.name, deps);
      if (existing) {
        return await persistWafRuleset(deps.state, buildWafRulesetRecord(existing));
      }
    }
    throw error;
  }
}
