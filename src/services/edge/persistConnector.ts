import { EdgeConnectorRecord } from '../../models/edgeConnectorRecord.js';
import { EdgeConnectorState } from '../../models/edgeConnectorState.js';
import { EDGE_CONNECTOR_STATE_FILE } from './constants.js';
import { normalizeConnectorState } from './normalizeConnectorState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistConnector(
  state: StateRepository,
  record: EdgeConnectorRecord,
): Promise<EdgeConnectorRecord> {
  const current = normalizeConnectorState(await state.read<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  current.connectors[record.name] = record;
  await state.write(EDGE_CONNECTOR_STATE_FILE, current);
  return record;
}
