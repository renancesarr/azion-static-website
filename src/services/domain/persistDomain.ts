import { readStateFile, writeStateFile } from '../../utils/state.js';
import { DomainRecord } from '../../models/entities/domainRecord.js';
import type { DomainState } from '../../models/shared/domainState.js';
import { DOMAIN_STATE_FILE } from './constants.js';
import { normalizeDomainState } from './normalizeDomainState.js';

export async function persistDomain(record: DomainRecord): Promise<DomainRecord> {
  const current = normalizeDomainState(await readStateFile<DomainState>(DOMAIN_STATE_FILE));
  current.domains[record.name] = record.toJSON();
  await writeStateFile(DOMAIN_STATE_FILE, current);
  return record;
}
