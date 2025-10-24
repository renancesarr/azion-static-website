import { HttpError } from '../../utils/http.js';
import { AzionEdgeApplication } from '../../models/azionEdgeApplication.js';
import { AzionEdgeApplicationResponse } from '../../models/azionEdgeApplicationResponse.js';
import { CreateEdgeAppInput } from './schemas.js';
import { buildEdgeApplicationRecord } from './buildEdgeApplicationRecord.js';
import { persistEdgeApplication } from './persistEdgeApplication.js';
import { findEdgeApplicationByNameApi } from './findEdgeApplicationByNameApi.js';
import type { EdgeDependencies } from './types.js';
import { defaultEdgeDependencies } from './dependencies.js';

export async function createEdgeApplicationViaApi(
  input: CreateEdgeAppInput,
  deps: EdgeDependencies = defaultEdgeDependencies,
) {
  try {
    const response = await deps.http<AzionEdgeApplicationResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/edge_applications`,
      body: {
        name: input.name,
        delivery_protocol: input.deliveryProtocol,
        origin_protocol_policy: input.originProtocol,
        caching: input.caching,
        waf: {
          active: input.enableWaf,
        },
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionEdgeApplication);
    return await persistEdgeApplication(buildEdgeApplicationRecord(payload));
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findEdgeApplicationByNameApi(input.name, deps);
      if (existing) {
        return await persistEdgeApplication(buildEdgeApplicationRecord(existing));
      }
    }
    throw error;
  }
}
