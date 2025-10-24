import { HttpError } from '../../utils/http.js';
import type { EnsureResult } from '../../utils/ensure.js';
import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';
import { CreateRuleInput } from './schemas.js';
import { findRuleByOrder } from './findRuleByOrder.js';
import { createRuleViaApi } from './createRuleViaApi.js';
import { findRuleByOrderApi } from './findRuleByOrderApi.js';
import { persistRule } from './persistRule.js';
import { buildRuleRecord } from './buildRuleRecord.js';
import type { EdgeDependencies } from './types.js';
import { defaultEdgeDependencies } from './dependencies.js';

export async function ensureCacheRule(
  input: CreateRuleInput,
  deps: EdgeDependencies = defaultEdgeDependencies,
): Promise<EnsureResult<EdgeRuleRecord>> {
  const cached = await findRuleByOrder(input.edgeApplicationId, input.phase, input.order);
  if (cached) {
    return { record: cached, created: false };
  }

  try {
    const created = await createRuleViaApi(input, deps);
    return { record: created, created: true };
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await findRuleByOrderApi(input.edgeApplicationId, input.phase, input.order, deps);
      if (existing) {
        const record = await persistRule(buildRuleRecord(existing, input.edgeApplicationId));
        return { record, created: false };
      }
    }
    throw error;
  }
}
