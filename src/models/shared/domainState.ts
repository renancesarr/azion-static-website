import type { DomainRecordData } from './domainRecordData.js';

export interface DomainState {
  domains: Record<string, DomainRecordData>;
}
