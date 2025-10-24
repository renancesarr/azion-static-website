import { readStateFile, writeStateFile } from '../../utils/state.js';
import { DomainRecord } from '../../models/domainRecord.js';
import { DomainState } from '../../models/domainState.js';
import { DOMAIN_STATE_FILE } from './constants.js';
import { normalizeDomainState } from './normalizeDomainState.js';

export async function persistDomain(record: DomainRecord): Promise<DomainRecord> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  current.domains[record.name] = record;
  await writeStateFile(DOMAIN_STATE_FILE, current);
  return record;
}
