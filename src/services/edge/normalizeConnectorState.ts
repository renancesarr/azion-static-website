import type { EdgeConnectorState } from '../../models/shared/edgeConnectorState.js';

export function normalizeConnectorState(state?: EdgeConnectorState): EdgeConnectorState {
  if (!state) {
    return { connectors: {} };
  }
  return { connectors: state.connectors ?? {} };
}
