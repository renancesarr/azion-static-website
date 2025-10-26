import type { AzionEdgeApplication } from '../../models/dto/azionEdgeApplication.js';
import type { AzionEdgeApplicationListResponse } from '../../models/dto/azionEdgeApplicationListResponse.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';

export async function findEdgeApplicationByNameApi(
  name: string,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<AzionEdgeApplication | undefined> {
  const response = await deps.http.request<AzionEdgeApplicationListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/edge_applications?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((app: AzionEdgeApplication) => app.name === name);
}
