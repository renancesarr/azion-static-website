import { EdgeApplicationRecord } from './edgeApplicationRecord.js';

export interface EdgeAppState {
  applications: Record<string, EdgeApplicationRecord>;
}
