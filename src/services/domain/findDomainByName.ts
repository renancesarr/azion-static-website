import { readStateFile } from '../../utils/state.js';
import { DomainRecord } from '../../models/domainRecord.js';
import { DomainState } from '../../models/domainState.js';
import { DOMAIN_STATE_FILE } from './constants.js';
import { normalizeDomainState } from './normalizeDomainState.js';

export async function findDomainByName(name: string): Promise<DomainRecord | undefined> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  return current.domains[name];
}
