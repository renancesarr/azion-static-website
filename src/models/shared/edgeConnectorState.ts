import type { EdgeConnectorRecordData } from './edgeConnectorRecordData.js';

export interface EdgeConnectorState {
  connectors: Record<string, EdgeConnectorRecordData>;
}
