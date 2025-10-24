import type { EnsureResult } from '../../utils/ensure.js';
import { FirewallRecord } from '../../models/firewallRecord.js';
import { CreateFirewallInput } from './schemas.js';
import { findFirewallByName } from './findFirewallByName.js';
import { createFirewallViaApi } from './createFirewallViaApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function ensureFirewall(
  input: CreateFirewallInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
): Promise<EnsureResult<FirewallRecord>> {
  const cached = await findFirewallByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createFirewallViaApi(input, deps);
  return { record, created: true };
}
