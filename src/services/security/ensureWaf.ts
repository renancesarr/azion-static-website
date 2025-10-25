import type { EnsureResult } from '../../utils/ensure.js';
import { WafPolicyRecord } from '../../models/wafPolicyRecord.js';
import { ConfigureWafInput } from './schemas.js';
import { findWaf } from './findWaf.js';
import { configureWafViaApi } from './configureWafViaApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function ensureWaf(
  input: ConfigureWafInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<EnsureResult<WafPolicyRecord>> {
  const cached = await findWaf(deps.state, input.edgeApplicationId);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await configureWafViaApi(input, deps);
  return { record, created: true };
}
