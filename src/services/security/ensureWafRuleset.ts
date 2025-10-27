import type { EnsureResult } from '../../utils/ensure.js';
import { WafRulesetRecord } from '../../models/entities/wafRulesetRecord.js';
import { CreateWafRulesetInput } from './schemas.js';
import { findWafRulesetByName } from './findWafRulesetByName.js';
import { createWafRulesetViaApi } from './createWafRulesetViaApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function ensureWafRuleset(
  input: CreateWafRulesetInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<EnsureResult<WafRulesetRecord>> {
  const cached = await findWafRulesetByName(deps.state, input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createWafRulesetViaApi(input, deps);
  return { record, created: true };
}
