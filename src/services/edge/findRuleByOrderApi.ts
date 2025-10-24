import { AzionRule } from '../../models/azionRule.js';
import { AzionRuleListResponse } from '../../models/azionRuleListResponse.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';

export async function findRuleByOrderApi(
  edgeApplicationId: string,
  phase: string,
  order: number,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<AzionRule | undefined> {
  const response = await deps.http<AzionRuleListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/edge_applications/${encodeURIComponent(edgeApplicationId)}/rules_engine/${encodeURIComponent(phase)}/rules`,
  });
  return response.data.results?.find((rule) => rule.order === order);
}
