import type { EnsureResult } from '../../utils/ensure.js';
import { EdgeApplicationRecord } from '../../models/entities/edgeApplicationRecord.js';
import { CreateEdgeAppInput } from './schemas.js';
import { findEdgeApplicationByName } from './findEdgeApplicationByName.js';
import { createEdgeApplicationViaApi } from './createEdgeApplicationViaApi.js';
import type { EdgeDependencies } from './types.js';
import { defaultEdgeDependencies } from './dependencies.js';

export async function ensureEdgeApplication(
  input: CreateEdgeAppInput,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<EnsureResult<EdgeApplicationRecord>> {
  const cached = await findEdgeApplicationByName(deps.state, input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createEdgeApplicationViaApi(input, deps);
  return { record, created: true };
}
