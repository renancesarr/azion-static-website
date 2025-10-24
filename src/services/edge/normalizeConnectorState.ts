import { EdgeConnectorState } from '../../models/edgeConnectorState.js';

export function normalizeConnectorState(state?: EdgeConnectorState): EdgeConnectorState {
  if (!state) {
    return { connectors: {} };
  }
  return { connectors: state.connectors ?? {} };
}
