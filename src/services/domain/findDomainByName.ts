import { DomainRecord } from '../../models/entities/domainRecord.js';
import { createDomainCacheRepository } from './repositories/domainCacheRepository.js';

export async function findDomainByName(name: string): Promise<DomainRecord | undefined> {
  const repository = createDomainCacheRepository();
  return repository.getByName(name);
}
