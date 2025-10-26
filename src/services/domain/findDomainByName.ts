import { readStateFile } from '../../utils/state.js';
import { DomainRecord } from '../../models/entities/domainRecord.js';
import type { DomainState } from '../../models/shared/domainState.js';
import { DOMAIN_STATE_FILE } from './constants.js';
import { normalizeDomainState } from './normalizeDomainState.js';

export async function findDomainByName(name: string): Promise<DomainRecord | undefined> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  const record = current.domains[name];
  if (!record) {
    return undefined;
  }
  return DomainRecord.hydrate(record);
}
