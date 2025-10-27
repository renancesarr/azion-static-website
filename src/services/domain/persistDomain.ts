import { DomainRecord } from '../../models/entities/domainRecord.js';
import { createDomainCacheRepository } from './repositories/domainCacheRepository.js';

export async function persistDomain(record: DomainRecord): Promise<DomainRecord> {
  const repository = createDomainCacheRepository();
  return repository.save(record);
}
