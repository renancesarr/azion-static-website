import { DomainRecord } from './domainRecord.js';

export interface DomainState {
  domains: Record<string, DomainRecord>;
}
