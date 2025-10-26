import type { DomainRecordData } from '../shared/domainRecordData.js';

export interface DomainState {
  domains: Record<string, DomainRecordData>;
}
