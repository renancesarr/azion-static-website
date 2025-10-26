import type { AzionConnector } from '../../models/dto/azionConnector.js';
import type { AzionConnectorListResponse } from '../../models/dto/azionConnectorListResponse.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';

export async function findConnectorByNameApi(
  name: string,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<AzionConnector | undefined> {
  const response = await deps.http.request<AzionConnectorListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/edge_applications/connectors?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((connector: AzionConnector) => connector.name === name);
}
