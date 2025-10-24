import { readStateFile, writeStateFile } from '../../utils/state.js';
import { EdgeConnectorRecord } from '../../models/edgeConnectorRecord.js';
import { EdgeConnectorState } from '../../models/edgeConnectorState.js';
import { EDGE_CONNECTOR_STATE_FILE } from './constants.js';
import { normalizeConnectorState } from './normalizeConnectorState.js';

export async function persistConnector(record: EdgeConnectorRecord): Promise<EdgeConnectorRecord> {
  const current = normalizeConnectorState(await readStateFile<EdgeConnectorState>(EDGE_CONNECTOR_STATE_FILE));
  current.connectors[record.name] = record;
  await writeStateFile(EDGE_CONNECTOR_STATE_FILE, current);
  return record;
}
