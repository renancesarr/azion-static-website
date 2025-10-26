import type { AzionRule } from '../../models/dto/azionRule.js';
import type { AzionRuleResponse } from '../../models/dto/azionRuleResponse.js';
import { CreateRuleInput } from './schemas.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';
import { persistRule } from './persistRule.js';
import { buildRuleRecord } from './buildRuleRecord.js';

export async function createRuleViaApi(
  input: CreateRuleInput,
  deps: EdgeDependencies = defaultEdgeDependencies,
) {
  const response = await deps.http.request<AzionRuleResponse>({
    method: 'POST',
    url: `${deps.apiBase}/v4/edge_applications/${encodeURIComponent(input.edgeApplicationId)}/rules_engine/${encodeURIComponent(input.phase)}/rules`,
    body: {
      name: input.description ?? 'rule-auto',
      phase: input.phase,
      order: input.order,
      behaviors: input.behaviors,
      criteria: input.criteria,
      description: input.description,
    },
  });
  const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionRule);
  return await persistRule(deps.state, buildRuleRecord(payload, input.edgeApplicationId));
}
