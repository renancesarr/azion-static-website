import { readStateFile } from '../../utils/state.js';
import { EdgeConnectorRecord } from '../../models/edgeConnectorRecord.js';
import { EdgeConnectorState } from '../../models/edgeConnectorState.js';
import { EDGE_CONNECTOR_STATE_FILE } from './constants.js';
import { normalizeConnectorState } from './normalizeConnectorState.js';

export async function findConnectorByName(name: string): Promise<EdgeConnectorRecord | undefined> {
  const current = normalizeConnectorState(await readStateFile<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  return current.connectors[name];
}
