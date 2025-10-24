import { AzionWafPolicy } from '../../models/azionWafPolicy.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function fetchWafByEdgeAppApi(
  edgeApplicationId: string,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<AzionWafPolicy | undefined> {
  const response = await deps.http<{ results?: AzionWafPolicy[] }>({
    method: 'GET',
    url: `${deps.apiBase}/v4/waf/policies?edge_application_id=${encodeURIComponent(edgeApplicationId)}`,
  });
  return response.data.results?.find((policy: AzionWafPolicy) => policy.edge_application_id === edgeApplicationId);
}
