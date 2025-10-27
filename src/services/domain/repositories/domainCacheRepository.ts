import { readStateFile, writeStateFile } from '../../../utils/state.js';
import { DomainRecord } from '../../../models/entities/domainRecord.js';
import type { DomainState } from '../../../models/shared/domainState.js';
import { DOMAIN_STATE_FILE } from '../constants.js';
import { normalizeDomainState } from '../normalizeDomainState.js';

export interface DomainCacheRepository {
  getByName(name: string): Promise<DomainRecord | undefined>;
  save(record: DomainRecord): Promise<DomainRecord>;
}

export function createDomainCacheRepository(): DomainCacheRepository {
  return {
    async getByName(name: string): Promise<DomainRecord | undefined> {
      const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
      const record = current.domains[name];
      if (!record) {
        return undefined;
      }
      return DomainRecord.hydrate(record);
    },
    async save(record: DomainRecord): Promise<DomainRecord> {
      const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
      current.domains[record.name] = record.toJSON();
      await writeStateFile(DOMAIN_STATE_FILE, current);
      return record;
    },
  };
}
