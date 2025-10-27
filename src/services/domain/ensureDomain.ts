import type { EnsureResult } from '../../utils/ensure.js';
import { CreateDomainInput } from './schemas.js';
import type { DomainDependencies } from './types.js';
import { defaultDomainDependencies } from './dependencies.js';
import { createDomainService } from './domainService.js';

export async function ensureDomain(
  input: CreateDomainInput,
  deps: DomainDependencies = defaultDomainDependencies,
): ReturnType<ReturnType<typeof createDomainService>['ensureDomain']> {
  const service = createDomainService({ dependencies: deps });
  return service.ensureDomain(input);
}
