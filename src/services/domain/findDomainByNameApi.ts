import type { DomainDependencies } from './types.js';
import { createDomainApiRepository } from './repositories/domainApiRepository.js';
import { defaultDomainDependencies } from './dependencies.js';

export async function findDomainByNameApi(
  name: string,
  deps: DomainDependencies = defaultDomainDependencies,
): ReturnType<ReturnType<typeof createDomainApiRepository>['findByName']> {
  const repository = createDomainApiRepository(deps);
  return repository.findByName(name);
}
