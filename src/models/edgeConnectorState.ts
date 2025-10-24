import { EdgeConnectorRecord } from './edgeConnectorRecord.js';

export interface EdgeConnectorState {
  connectors: Record<string, EdgeConnectorRecord>;
}
