import { HttpError } from '../../utils/http.js';
import type { EnsureResult } from '../../utils/ensure.js';
import { EdgeConnectorRecord } from '../../models/entities/edgeConnectorRecord.js';
import { CreateConnectorInput } from './schemas.js';
import { findConnectorByName } from './findConnectorByName.js';
import { createConnectorViaApi } from './createConnectorViaApi.js';
import { findConnectorByNameApi } from './findConnectorByNameApi.js';
import { persistConnector } from './persistConnector.js';
import { buildConnectorRecord } from './buildConnectorRecord.js';
import type { EdgeDependencies } from './types.js';
import { defaultEdgeDependencies } from './dependencies.js';

export type ConnectorInputWithBucket = CreateConnectorInput & { bucketId: string; bucketName?: string };

export async function ensureEdgeConnector(
  input: ConnectorInputWithBucket,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<EnsureResult<EdgeConnectorRecord>> {
  const cached = await findConnectorByName(deps.state, input.name);
  if (cached) {
    return { record: cached, created: false };
  }

  try {
    const created = await createConnectorViaApi(input, deps);
    return { record: created, created: true };
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findConnectorByNameApi(input.name, deps);
      if (existing) {
        const record = await persistConnector(deps.state, buildConnectorRecord(existing, input.bucketId, input.bucketName));
        return { record, created: false };
      }
    }
    throw error;
  }
}
