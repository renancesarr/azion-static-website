import type { EnsureResult } from '../../utils/ensure.js';
import { DomainRecord } from '../../models/domainRecord.js';
import { CreateDomainInput } from './schemas.js';
import { findDomainByName } from './findDomainByName.js';
import { createDomainViaApi } from './createDomainViaApi.js';
import type { DomainDependencies } from './types.js';
import { defaultDomainDependencies } from './dependencies.js';

export async function ensureDomain(
  input: CreateDomainInput,
  deps: DomainDependencies = defaultDomainDependencies,
): Promise<EnsureResult<DomainRecord>> {
  const cached = await findDomainByName(input.name);
  if (cached) {
    return { record: cached, created: false };
  }
  const record = await createDomainViaApi(input, deps);
  return { record, created: true };
}
