import { AzionConnector } from '../../models/azionConnector.js';
import { AzionConnectorResponse } from '../../models/azionConnectorResponse.js';
import { CreateConnectorInput } from './schemas.js';
import { defaultEdgeDependencies } from './dependencies.js';
import type { EdgeDependencies } from './types.js';
import { persistConnector } from './persistConnector.js';
import { buildConnectorRecord } from './buildConnectorRecord.js';

export async function createConnectorViaApi(
  input: CreateConnectorInput & { bucketId: string; bucketName?: string },
  deps: EdgeDependencies = defaultEdgeDependencies,
) {
  const response = await deps.http<AzionConnectorResponse>({
    method: 'POST',
    url: `${deps.apiBase}/v4/edge_applications/connectors`,
    body: {
      name: input.name,
      origin_type: 'edge_storage',
      origin_id: input.bucketId,
      origin_path: input.originPath,
    },
  });
  const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionConnector);
  return await persistConnector(buildConnectorRecord(payload, input.bucketId, input.bucketName));
}
