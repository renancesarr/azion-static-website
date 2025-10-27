import { CreateDomainInput } from './schemas.js';
import { createDomainService } from './domainService.js';
import type { DomainDependencies } from './types.js';
import { defaultDomainDependencies } from './dependencies.js';

export async function createDomainViaApi(
  input: CreateDomainInput,
  deps: DomainDependencies = defaultDomainDependencies,
): ReturnType<ReturnType<typeof createDomainService>['createDomain']> {
  const service = createDomainService({ dependencies: deps });
  return service.createDomain(input);
}
