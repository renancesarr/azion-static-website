import { AzionDomain } from '../../models/azionDomain.js';
import { DomainRecord } from '../../models/domainRecord.js';

export function buildDomainRecord(payload: AzionDomain): DomainRecord {
  return {
    id: payload.id,
    name: payload.name,
    edgeApplicationId: payload.edge_application_id,
    isActive: payload.active,
    cname: payload.cname,
    createdAt: payload.created_at ?? new Date().toISOString(),
    raw: payload,
  };
}
