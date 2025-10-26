import type { EdgeApplicationRecordData } from './edgeApplicationRecordData.js';

export interface EdgeAppState {
  applications: Record<string, EdgeApplicationRecordData>;
}
