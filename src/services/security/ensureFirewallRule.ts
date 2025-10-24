import type { EnsureResult } from '../../utils/ensure.js';
import { FirewallRuleBinding } from '../../models/firewallRuleBinding.js';
import { ApplyWafRulesetInput } from './schemas.js';
import { findFirewallRuleBindingFromState } from './persistFirewallRule.js';
import { applyWafRulesetViaApi } from './applyWafRulesetViaApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function ensureFirewallRule(
  input: ApplyWafRulesetInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<EnsureResult<FirewallRuleBinding>> {
  const cached = await findFirewallRuleBindingFromState(input.firewallId, input.rulesetId);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await applyWafRulesetViaApi(input, deps);
  return { record, created: true };
}
