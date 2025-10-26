import { EdgeConnectorRecord } from '../../models/entities/edgeConnectorRecord.js';
import type { EdgeConnectorState } from '../../models/shared/edgeConnectorState.js';
import { EDGE_CONNECTOR_STATE_FILE } from './constants.js';
import { normalizeConnectorState } from './normalizeConnectorState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findConnectorByName(
  state: StateRepository,
  name: string,
): Promise<EdgeConnectorRecord | undefined> {
  const current = normalizeConnectorState(await state.read<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  const record = current.connectors[name];
  if (!record) {
    return undefined;
  }
  return EdgeConnectorRecord.hydrate(record);
}
