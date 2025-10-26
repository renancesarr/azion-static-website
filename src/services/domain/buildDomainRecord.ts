import type { AzionDomain } from '../../models/dto/azionDomain.js';
import { DomainRecord } from '../../models/entities/domainRecord.js';

export function buildDomainRecord(payload: AzionDomain): DomainRecord {
  return DomainRecord.fromAzionPayload(payload);
}
